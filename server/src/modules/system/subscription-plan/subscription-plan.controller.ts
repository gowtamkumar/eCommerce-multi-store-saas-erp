import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { SubscriptionPlanResponseDto } from './dto/subscription-plan-response.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanService } from './subscription-plan.service'

@Controller('super-admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SubscriptionPlanController {
  private readonly logger = new Logger(SubscriptionPlanController.name)

  constructor(private readonly planService: SubscriptionPlanService) {}

  @Post()
  async createSubscriptionPlan(
    @Body() createDto: CreateSubscriptionPlanDto,
  ): Promise<BaseApiSuccessResponse<SubscriptionPlanResponseDto>> {
    const plan = await this.planService.createSubscriptionPlan(createDto)
    return {
      success: true,
      statusCode: 201,
      message: 'Subscription plan created successfully',
      data: plan,
    }
  }

  @Get()
  async findAllSubscriptionPlans(): Promise<BaseApiSuccessResponse<SubscriptionPlanResponseDto[]>> {
    const plans = await this.planService.findAllSubscriptionPlans()
    return {
      success: true,
      statusCode: 200,
      message: 'Subscription plans retrieved successfully',
      data: plans,
    }
  }

  @Get(':id')
  async findOneSubscriptionPlan(
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<SubscriptionPlanResponseDto>> {
    const plan = await this.planService.findOneSubscriptionPlan(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Subscription plan retrieved successfully',
      data: plan,
    }
  }

  @Patch(':id')
  async updateSubscriptionPlan(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionPlanDto,
  ): Promise<BaseApiSuccessResponse<SubscriptionPlanResponseDto>> {
    const plan = await this.planService.updateSubscriptionPlan(id, updateDto)
    return {
      success: true,
      statusCode: 200,
      message: 'Subscription plan updated successfully',
      data: plan,
    }
  }

  @Delete(':id')
  async removeSubscriptionPlan(
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.planService.removeSubscriptionPlan(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Subscription plan deleted successfully',
      data: null,
    }
  }
}
