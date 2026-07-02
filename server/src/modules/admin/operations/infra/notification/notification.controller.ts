import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  Post,
  Body,
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

  @Post('broadcast')
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Broadcast a global, bulk, or store-specific notification' })
  async broadcastNotification(
    @Body() dto: { title: string; message: string; type?: string; link?: string; storeId?: string },
  ): Promise<BaseApiSuccessResponse<any>> {
    if (dto.storeId === 'all') {
      const notifications = await this.notificationService.broadcastToAllStores({
        title: dto.title,
        message: dto.message,
        type: dto.type,
        link: dto.link,
      })
      return {
        success: true,
        statusCode: 201,
        message: `Notification broadcasted to ${notifications.length} stores`,
        data: null,
      }
    } else {
      const targetStoreId = dto.storeId && dto.storeId !== 'global' ? dto.storeId : null
      const notification = await this.notificationService.createNotification(
        {
          title: dto.title,
          message: dto.message,
          type: dto.type,
          link: dto.link,
        },
        targetStoreId,
      )
      return {
        success: true,
        statusCode: 201,
        message: 'Notification broadcasted successfully',
        data: notification,
      }
    }
  }
}
