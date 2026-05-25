import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SubscriptionPlanRepository } from './subscription-plan.repository'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { normalizeFeatures } from '@/common/constants/feature-mapping'

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name)

  constructor(private readonly planRepository: SubscriptionPlanRepository) {}

  async createSubscriptionPlan(
    createDto: CreateSubscriptionPlanDto,
    ctx: RequestContextDto,
  ): Promise<SubscriptionPlanEntity> {
    this.logger.log(`${this.createSubscriptionPlan.name} Service Called`)
    if (createDto.features) {
      createDto.features = normalizeFeatures(createDto.features)
    }
    const plan = await this.planRepository.createAndSave(createDto, ctx)
    return plan
  }

  async findAllSubscriptionPlans(): Promise<SubscriptionPlanEntity[]> {
    this.logger.log(`${this.findAllSubscriptionPlans.name} Service Called`)
    const plans = await this.planRepository.findAllSortedByPrice()
    return plans
  }

  async findOneSubscriptionPlan(id: string): Promise<SubscriptionPlanEntity> {
    this.logger.log(`${this.findOneSubscriptionPlan.name} Service Called`)
    const plan = await this.planRepository.findById(id)
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID "${id}" not found`)
    }
    return plan
  }

  async updateSubscriptionPlan(
    id: string,
    updateDto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    this.logger.log(`${this.updateSubscriptionPlan.name} Service Called`)
    const plan = await this.planRepository.findById(id)
    if (updateDto.features) {
      updateDto.features = normalizeFeatures(updateDto.features)
    }
    const updated = await this.planRepository.updateAndSave(plan, updateDto)
    return updated
  }

  async removeSubscriptionPlan(id: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeSubscriptionPlan.name} Service Called`)
    const plan = await this.planRepository.findById(id)
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID "${id}" not found`)
    }
    await this.planRepository.removePlan(plan)
    return { success: true, message: 'Subscription plan deleted successfully' }
  }

  async findActiveSubscriptionPlans(): Promise<SubscriptionPlanEntity[]> {
    this.logger.log(`${this.findActiveSubscriptionPlans.name} Service Called`)
    const plans = await this.planRepository.findActiveSortedByPrice()
    return plans
  }
}
