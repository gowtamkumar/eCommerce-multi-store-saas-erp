import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { NotificationEntity } from './entities/notification.entity'
import { NotificationGateway } from './notification.gateway'

export interface CreateNotificationDto {
  userId?: string
  title: string
  message: string
  type?: string
  link?: string
}

import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'


@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create a new in-app system notification
   */
  async createNotification(
    dto: CreateNotificationDto,
    tenantId: string | null,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      tenantId,
      userId: dto.userId || null,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'SYSTEM',
      link: dto.link,
      isRead: false,
    })

    const savedNotification = await this.notificationRepository.save(notification)

    try {
      if (dto.userId) {
        // Send to specific user
        this.notificationGateway.sendToUser(dto.userId, 'notification', savedNotification)
      } else if (tenantId) {
        // Broadcast to whole tenant
        this.notificationGateway.sendToTenant(tenantId, 'notification', savedNotification)
      } else {
        // Global system notification (Super Admins)
        this.notificationGateway.sendToRole('SUPER_ADMIN', 'notification', savedNotification)
      }
    } catch (wsError: any) {
      this.logger.error('Failed to dispatch notification over WebSockets', wsError.stack)
    }

    return savedNotification
  }

  /**
   * Fetch all notifications for a specific user and tenant-wide
   */
  async getUserNotifications(
    ctx: RequestContextDto,
    limit: number = 20,
    offset: number = 0,
    type?: string,
    search?: string,
  ): Promise<[NotificationEntity[], number]> {
    const query = this.notificationRepository.createQueryBuilder('notification')

    // Filter by tenant and user
    if (ctx.tenantId) {
      query.andWhere('notification.tenantId = :tenantId', { tenantId: ctx.tenantId })
    } else {
      query.andWhere('notification.tenantId IS NULL')
    }

    if (ctx.userId) {
      query.andWhere('(notification.userId = :userId OR notification.userId IS NULL)', {
        userId: ctx.userId,
      })
    } else {
      query.andWhere('notification.userId IS NULL')
    }

    // Filter by type if specified and not 'ALL'
    if (type && type !== 'ALL') {
      query.andWhere('notification.type = :type', { type })
    }

    // Filter by search query matching title or message case-insensitively
    if (search) {
      query.andWhere('(notification.title ILIKE :search OR notification.message ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    query.orderBy('notification.createdAt', 'DESC').skip(offset).take(limit)

    return await query.getManyAndCount()
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string, ctx: RequestContextDto): Promise<void> {
    const tenantId = ctx.tenantId || IsNull()
    const userId = ctx.userId || IsNull()

    const notification = await this.notificationRepository.findOne({
      where: [
        { id, tenantId, userId },
        { id, tenantId, userId: IsNull() },
      ],
    })

    if (notification) {
      notification.isRead = true
      await this.notificationRepository.save(notification)
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(ctx: RequestContextDto): Promise<void> {
    const qb = this.notificationRepository.createQueryBuilder('notification')
      .update(NotificationEntity)
      .set({ isRead: true })
      .where('is_read = :isRead', { isRead: false })

    if (ctx.tenantId) {
      qb.andWhere('tenant_id = :tenantId', { tenantId: ctx.tenantId })
    } else {
      qb.andWhere('tenant_id IS NULL')
    }

    if (ctx.userId) {
      qb.andWhere('(user_id = :userId OR user_id IS NULL)', { userId: ctx.userId })
    } else {
      qb.andWhere('user_id IS NULL')
    }

    await qb.execute()
  }

  /**
   * Get unread count
   */
  async getUnreadCount(ctx: RequestContextDto): Promise<number> {
    const tenantId = ctx.tenantId || IsNull()
    const userId = ctx.userId || IsNull()

    return await this.notificationRepository.count({
      where: [
        { tenantId, userId, isRead: false },
        { tenantId, userId: IsNull(), isRead: false },
      ],
    })
  }

  /**
   * Broadcast a notification to all active tenants (bulk)
   */
  async broadcastToAllTenants(dto: CreateNotificationDto): Promise<NotificationEntity[]> {
    const tenants = await this.tenantRepository.find({
      select: { id: true },
      where: { status: TenantStatus.ACTIVE },
    })
    const notifications: NotificationEntity[] = []

    for (const tenant of tenants) {
      try {
        const notif = await this.createNotification(dto, tenant.id)
        notifications.push(notif)
      } catch (err: any) {
        this.logger.error(`Failed to send bulk notification to tenant ${tenant.id}: ${err.message}`)
      }
    }

    return notifications
  }
}
