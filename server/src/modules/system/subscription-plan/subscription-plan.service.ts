import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SubscriptionPlanRepository } from './subscription-plan.repository'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name)

  constructor(private readonly planRepository: SubscriptionPlanRepository) {}

  async createSubscriptionPlan(createDto: CreateSubscriptionPlanDto, ctx: RequestContextDto): Promise<SubscriptionPlanEntity> {
    this.logger.log(`${this.createSubscriptionPlan.name} Service Called`)
    return await this.planRepository.createAndSave(createDto, ctx)
  }

  async findAllSubscriptionPlans(): Promise<SubscriptionPlanEntity[]> {
    this.logger.log(`${this.findAllSubscriptionPlans.name} Service Called`)
    return await this.planRepository.findAllSortedByPrice()
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
    const plan = await this.findOneSubscriptionPlan(id)
    return await this.planRepository.updateAndSave(plan, updateDto)
  }

  async removeSubscriptionPlan(id: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeSubscriptionPlan.name} Service Called`)
    const plan = await this.findOneSubscriptionPlan(id)
    await this.planRepository.removePlan(plan)
    return { success: true, message: 'Subscription plan deleted successfully' }
  }

  async findActiveSubscriptionPlans(): Promise<SubscriptionPlanEntity[]> {
    this.logger.log(`${this.findActiveSubscriptionPlans.name} Service Called`)
    return await this.planRepository.findActiveSortedByPrice()
  }
}
