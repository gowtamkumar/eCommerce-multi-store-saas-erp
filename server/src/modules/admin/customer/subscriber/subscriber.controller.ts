import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { Body, Controller, Get, Logger, Post, Query, UseGuards } from '@nestjs/common'
import { SubscriberResponseDto } from './dto/subscriber-response.dto'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberService } from './subscriber.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@UseGuards(SubscriptionGuard)
@RequireFeature('/admin/subscribers')
@Controller('subscribers')
export class SubscriberController {
  private readonly logger = new Logger(SubscriberController.name)

  constructor(private readonly subscriberService: SubscriberService) {}

  @Post()
  async createSubscriber(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSubscriber.`)
    const result = await this.subscriberService.createSubscriber(createSubscriberDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Subscribed successfully',
      data: result as any,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllSubscribers(
    @Query() filterDto: any,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllSubscribers.`)
    const { subscribers, total } = await this.subscriberService.findAllSubscribers(filterDto, ctx)

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
