import { Controller, Get } from '@nestjs/common'
import { SubscriptionPlanService } from './subscription-plan.service'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SubscriptionPlanResponseDto } from './dto/subscription-plan-response.dto'

@Controller('plans')
export class PublicSubscriptionPlanController {
  constructor(private readonly planService: SubscriptionPlanService) {}

  @Get()
  async findActiveSubscriptionPlans(): Promise<BaseApiSuccessResponse<SubscriptionPlanResponseDto[]>> {
    const plans = await this.planService.findActiveSubscriptionPlans()
    return {
      success: true,
      statusCode: 200,
      message: 'Active subscription plans retrieved successfully',
      data: plans as any,
    }
  }
}
