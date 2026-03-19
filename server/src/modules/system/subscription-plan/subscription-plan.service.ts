import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'

@Injectable()
export class SubscriptionPlanService {
    private readonly logger = new Logger(SubscriptionPlanService.name);

    constructor(
        @InjectRepository(SubscriptionPlanEntity)
        private readonly planRepository: Repository<SubscriptionPlanEntity>,
    ) { }

    async createSubscriptionPlan(createDto: CreateSubscriptionPlanDto) {
        this.logger.log(`${this.createSubscriptionPlan.name} Service Called`);
        const plan = this.planRepository.create(createDto)
        return await this.planRepository.save(plan)
    }

    async findAllSubscriptionPlans() {
        this.logger.log(`${this.findAllSubscriptionPlans.name} Service Called`);
        return await this.planRepository.find({
            order: { price: 'ASC' },
        })
    }

    async findOneSubscriptionPlan(id: string) {
        this.logger.log(`${this.findOneSubscriptionPlan.name} Service Called`);
        console.log("testing...", id);

        const plan = await this.planRepository.findOne({ where: { id } })

        console.log("plan", plan);

        if (!plan) {
            throw new NotFoundException(`Subscription plan with ID "${id}" not found`)
        }
        return plan
    }

    async updateSubscriptionPlan(id: string, updateDto: UpdateSubscriptionPlanDto) {
        this.logger.log(`${this.updateSubscriptionPlan.name} Service Called`);
        const plan = await this.findOneSubscriptionPlan(id)
        Object.assign(plan, updateDto)
        return await this.planRepository.save(plan)
    }

    async removeSubscriptionPlan(id: string) {
        this.logger.log(`${this.removeSubscriptionPlan.name} Service Called`);
        const plan = await this.findOneSubscriptionPlan(id)
        // Soft delete logic can be added here if needed, or simple delete
        // For now, let's just delete it, but in production consider soft delete or checking for active tenants
        return await this.planRepository.remove(plan)
    }

    async findActiveSubscriptionPlans() {
        this.logger.log(`${this.findActiveSubscriptionPlans.name} Service Called`);
        console.log("testing...");
        
        return await this.planRepository.find({
            where: { isActive: true },
            order: { price: 'ASC' },
        })
    }
}
