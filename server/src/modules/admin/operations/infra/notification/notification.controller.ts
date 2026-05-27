import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { NotificationEntity } from './entities/notification.entity'
import { NotificationService } from './notification.service'

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
    @Query('type') type?: string,
    @Query('search') search?: string,
  ): Promise<
    BaseApiSuccessResponse<{
      notifications: NotificationEntity[]
      total: number
      unreadCount: number
    }>
  > {
    const [notifications, total] = await this.notificationService.getUserNotifications(
      ctx,
      limit,
      offset,
      type,
      search,
    )
    const unreadCount = await this.notificationService.getUnreadCount(ctx)

    return {
      success: true,
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        total,
        unreadCount,
      },
    }
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.notificationService.markAllAsRead(ctx)

    return {
      success: true,
      statusCode: 200,
      message: 'All notifications marked as read',
      data: null,
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.notificationService.markAsRead(id, ctx)

    return {
      success: true,
      statusCode: 200,
      message: 'Notification marked as read',
      data: null,
    }
  }
}
