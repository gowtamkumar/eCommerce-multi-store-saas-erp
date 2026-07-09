import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable, Logger } from '@nestjs/common'
import { IsNull } from 'typeorm'
import { NotificationEntity } from './entities/notification.entity'
import { NotificationGateway } from './notification.gateway'

export interface CreateNotificationDto {
  userId?: string
  title: string
  message: string
  type?: string
  link?: string
}

import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { NotificationRepository } from './repositories/notification.repository'
import { StoreRepository } from '@/modules/system/store/store.repository'


@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly storeRepository: StoreRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create a new in-app system notification
   */
  async createNotification(
    dto: CreateNotificationDto,
    storeId: string | null,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      storeId,
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
      } else if (storeId) {
        // Broadcast to whole store
        this.notificationGateway.sendToStore(storeId, 'notification', savedNotification)
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
   * Fetch all notifications for a specific user and store-wide
   */
  async getUserNotifications(
    ctx: RequestContextDto,
    limit: number = 20,
    offset: number = 0,
    type?: string,
    search?: string,
  ): Promise<[NotificationEntity[], number]> {
    const query = this.notificationRepository.txRepo().createQueryBuilder('notification')

    // Filter by store and user
    if (ctx.storeId) {
      query.andWhere('notification.storeId = :storeId', { storeId: ctx.storeId })
    } else {
      query.andWhere('notification.storeId IS NULL')
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
    const storeId = ctx.storeId || IsNull()
    const userId = ctx.userId || IsNull()

    const notification = await this.notificationRepository.findOne({
      where: [
        { id, storeId, userId },
        { id, storeId, userId: IsNull() },
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
    const qb = this.notificationRepository.txRepo().createQueryBuilder('notification')
      .update(NotificationEntity)
      .set({ isRead: true })
      .where('is_read = :isRead', { isRead: false })

    if (ctx.storeId) {
      qb.andWhere('store_id = :storeId', { storeId: ctx.storeId })
    } else {
      qb.andWhere('store_id IS NULL')
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
    const storeId = ctx.storeId || IsNull()
    const userId = ctx.userId || IsNull()

    return await this.notificationRepository.txRepo().count({
      where: [
        { storeId, userId, isRead: false },
        { storeId, userId: IsNull(), isRead: false },
      ],
    })
  }

  /**
   * Broadcast a notification to all active stores (bulk)
   */
  async broadcastToAllStores(dto: CreateNotificationDto): Promise<NotificationEntity[]> {
    const stores = await this.storeRepository.find({
      select: { id: true },
      where: { status: StoreStatus.ACTIVE },
    })
    const notifications: NotificationEntity[] = []

    for (const store of stores) {
      try {
        const notif = await this.createNotification(dto, store.id)
        notifications.push(notif)
      } catch (err: any) {
        this.logger.error(`Failed to send bulk notification to store ${store.id}: ${err.message}`)
      }
    }

    return notifications
  }
}
