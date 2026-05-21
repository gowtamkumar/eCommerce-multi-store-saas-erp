import { RequestContextDto } from '@/common/dto/request-context.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

export interface CreateNotificationDto {
  userId?: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create a new in-app system notification
   */
  async createNotification(dto: CreateNotificationDto, tenantId: string | null): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      tenantId,
      userId: dto.userId || null,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'SYSTEM',
      link: dto.link,
      isRead: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    try {
      if (dto.userId) {
        // Send to specific user
        this.notificationGateway.sendToUser(dto.userId, 'notification', savedNotification);
      } else if (tenantId) {
        // Broadcast to whole tenant
        this.notificationGateway.sendToTenant(tenantId, 'notification', savedNotification);
      } else {
        // Global system notification (Super Admins)
        this.notificationGateway.sendToRole('SUPER_ADMIN', 'notification', savedNotification);
      }
    } catch (wsError) {
      this.logger.error('Failed to dispatch notification over WebSockets', wsError.stack);
    }

    return savedNotification;
  }

  /**
   * Fetch all notifications for a specific user and tenant-wide
   */
  async getUserNotifications(ctx: RequestContextDto, limit: number = 20, offset: number = 0): Promise<[NotificationEntity[], number]> {
    const tenantId = ctx.tenantId || IsNull();
    const userId = ctx.userId || IsNull();

    return await this.notificationRepository.findAndCount({
      where: [
        { tenantId, userId },
        { tenantId, userId: IsNull() },
      ],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string, ctx: RequestContextDto): Promise<void> {
    const tenantId = ctx.tenantId || IsNull();
    const userId = ctx.userId || IsNull();

    const notification = await this.notificationRepository.findOne({
      where: [
        { id, tenantId, userId },
        { id, tenantId, userId: IsNull() },
      ]
    });
    
    if (notification) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(ctx: RequestContextDto): Promise<void> {
    const tenantId = ctx.tenantId || IsNull();
    const userId = ctx.userId || IsNull();

    const notifications = await this.notificationRepository.find({
      where: [
        { tenantId, userId, isRead: false },
        { tenantId, userId: IsNull(), isRead: false },
      ]
    });
    
    for (const notif of notifications) {
      notif.isRead = true;
    }
    await this.notificationRepository.save(notifications);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(ctx: RequestContextDto): Promise<number> {
    const tenantId = ctx.tenantId || IsNull();
    const userId = ctx.userId || IsNull();

    return await this.notificationRepository.count({
      where: [
        { tenantId, userId, isRead: false },
        { tenantId, userId: IsNull(), isRead: false },
      ]
    });
  }
}
