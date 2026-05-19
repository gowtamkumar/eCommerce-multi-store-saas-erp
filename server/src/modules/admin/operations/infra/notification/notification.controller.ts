import { Controller, Get, Patch, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RequestContext } from '@/common/decorators/request-context.decorator';
import { RequestContextDto } from '@/common/dto/request-context.dto';
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto';
import { NotificationEntity } from './entities/notification.entity';

@ApiTags('System Notifications')
@Controller('infra/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user notifications' })
  async getUserNotifications(
    @RequestContext() ctx: RequestContextDto,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<BaseApiSuccessResponse<{ notifications: NotificationEntity[], total: number, unreadCount: number }>> {
    const [notifications, total] = await this.notificationService.getUserNotifications(ctx, limit, offset);
    const unreadCount = await this.notificationService.getUnreadCount(ctx);

    return {
      success: true,
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        total,
        unreadCount,
      },
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<null>> {
    await this.notificationService.markAllAsRead(ctx);
    
    return {
      success: true,
      statusCode: 200,
      message: 'All notifications marked as read',
      data: null,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.notificationService.markAsRead(id, ctx);
    
    return {
      success: true,
      statusCode: 200,
      message: 'Notification marked as read',
      data: null,
    };
  }
}
