import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { SubscriberResponseDto } from './dto/subscriber-response.dto'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberService } from './subscriber.service'

@Controller('subscribers')
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Post()
  async createSubscriber(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @TenantId() tenantId: string,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto>> {
    const result = await this.subscriberService.createSubscriber(createSubscriberDto, tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Subscribed successfully',
      data: result as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.MARKETING,
    UserRole.SUPPORT,
    UserRole.OPERATOR,
  )
  @Get()
  async findAllSubscribers(
    @Query() filterDto: any,
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto[]>> {
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN
    const targetTenantId = isSuperAdmin ? undefined : tenantId

    const { subscribers, total } = await this.subscriberService.findAllSubscribers(
      filterDto, 
      targetTenantId
    )
    
    return {
      success: true,
      statusCode: 200,
      message: 'List of subscribers retrieved',
      data: subscribers as any,
      pagination: {
        total,
        page: Number(filterDto.page) || 1,
        limit: Number(filterDto.limit) || 10,
        totalPages: Math.ceil(total / (Number(filterDto.limit) || 10)),
      },
    }
  }
}
