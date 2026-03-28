import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SubscriptionPlanRepository } from './subscription-plan.repository'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name)

  constructor(
    private readonly planRepository: SubscriptionPlanRepository,
  ) {}

  async createSubscriptionPlan(createDto: CreateSubscriptionPlanDto) {
    this.logger.log(`${this.createSubscriptionPlan.name} Service Called`)
    return await this.planRepository.createAndSave(createDto)
  }

  async findAllSubscriptionPlans() {
    this.logger.log(`${this.findAllSubscriptionPlans.name} Service Called`)
    return await this.planRepository.findAllSortedByPrice()
  }

  async findOneSubscriptionPlan(id: string) {
    this.logger.log(`${this.findOneSubscriptionPlan.name} Service Called`)
    const plan = await this.planRepository.findById(id)
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID "${id}" not found`)
    }
    return plan
  }

  async updateSubscriptionPlan(id: string, updateDto: UpdateSubscriptionPlanDto) {
    this.logger.log(`${this.updateSubscriptionPlan.name} Service Called`)
    const plan = await this.findOneSubscriptionPlan(id)
    return await this.planRepository.updateAndSave(plan, updateDto)
  }

  async removeSubscriptionPlan(id: string) {
    this.logger.log(`${this.removeSubscriptionPlan.name} Service Called`)
    const plan = await this.findOneSubscriptionPlan(id)
    return await this.planRepository.removePlan(plan)
  }

  async findActiveSubscriptionPlans() {
    this.logger.log(`${this.findActiveSubscriptionPlans.name} Service Called`)
    return await this.planRepository.findActiveSortedByPrice()
  }
}
