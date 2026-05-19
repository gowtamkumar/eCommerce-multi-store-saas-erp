import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { RequestContextDto } from '@/common/dto/request-context.dto';

export interface CreateNotificationDto {
  userId: string;
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
  ) {}

  /**
   * Create a new in-app system notification
   */
  async createNotification(dto: CreateNotificationDto, tenantId: string): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      tenantId,
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'SYSTEM',
      link: dto.link,
      isRead: false,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Fetch all notifications for a specific user and tenant-wide
   */
  async getUserNotifications(ctx: RequestContextDto, limit: number = 20, offset: number = 0): Promise<[NotificationEntity[], number]> {
    return await this.notificationRepository.findAndCount({
      where: [
        { tenantId: ctx.tenantId, userId: ctx.user.id },
        { tenantId: ctx.tenantId, userId: null as any },
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
    const notification = await this.notificationRepository.findOne({
      where: [
        { id, tenantId: ctx.tenantId, userId: ctx.user.id },
        { id, tenantId: ctx.tenantId, userId: null as any },
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
    const notifications = await this.notificationRepository.find({
      where: [
        { tenantId: ctx.tenantId, userId: ctx.user.id, isRead: false },
        { tenantId: ctx.tenantId, userId: null as any, isRead: false },
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
    return await this.notificationRepository.count({
      where: [
        { tenantId: ctx.tenantId, userId: ctx.user.id, isRead: false },
        { tenantId: ctx.tenantId, userId: null as any, isRead: false },
      ]
    });
  }
}
