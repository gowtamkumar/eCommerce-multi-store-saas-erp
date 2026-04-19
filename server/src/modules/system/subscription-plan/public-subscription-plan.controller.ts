import { Controller, Get } from '@nestjs/common'
import { SubscriptionPlanService } from './subscription-plan.service'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SubscriptionPlanResponseDto } from './dto/subscription-plan-response.dto'
import { Logger } from '@nestjs/common'

@Controller('plans')
export class PublicSubscriptionPlanController {
  private readonly logger = new Logger(PublicSubscriptionPlanController.name)
  constructor(private readonly planService: SubscriptionPlanService) {}

  @Get()
  async findActiveSubscriptionPlans(): Promise<
    BaseApiSuccessResponse<SubscriptionPlanResponseDto[]>
  > {
    this.logger.log('Finding active subscription plans')
    const plans = await this.planService.findActiveSubscriptionPlans()
    return {
      success: true,
      statusCode: 200,
      message: 'Active subscription plans retrieved successfully',
      data: plans as any,
    }
  }
}
