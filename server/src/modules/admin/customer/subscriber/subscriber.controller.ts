import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberService } from './subscriber.service'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SubscriberResponseDto } from './dto/subscriber-response.dto'

@Controller('subscribers')
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Post()
  async createSubscriber(
    @Body() createSubscriberDto: CreateSubscriberDto,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto>> {
    const result = await this.subscriberService.createSubscriber(createSubscriberDto)
    return {
      success: true,
      statusCode: 201,
      message: 'Subscribed successfully',
      data: result as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.MARKETING,
    UserRole.SUPPORT,
    UserRole.OPERATOR,
  )
  @Get()
  async findAllSubscribers(
    @Query() filterDto: any,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto[]>> {
    const { subscribers, total } = await this.subscriberService.findAllSubscribers(filterDto)
    return {
      success: true,
      statusCode: 200,
      message: 'List of subscribers retrieved',
      data: subscribers as any,
      pagination: {
        total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 10,
        totalPages: Math.ceil(total / (filterDto.limit || 10)),
      },
    }
  }
}
