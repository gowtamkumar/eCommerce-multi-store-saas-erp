import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'

@Injectable()
export class SubscriptionPlanService {
    constructor(
        @InjectRepository(SubscriptionPlanEntity)
        private readonly planRepository: Repository<SubscriptionPlanEntity>,
    ) { }

    async create(createDto: CreateSubscriptionPlanDto) {
        const plan = this.planRepository.create(createDto)
        return await this.planRepository.save(plan)
    }

    async findAll() {
        return await this.planRepository.find({
            order: { price: 'ASC' },
        })
    }

    async findOne(id: string) {
        const plan = await this.planRepository.findOne({ where: { id } })
        if (!plan) {
            throw new NotFoundException(`Subscription plan with ID "${id}" not found`)
        }
        return plan
    }

    async update(id: string, updateDto: UpdateSubscriptionPlanDto) {
        const plan = await this.findOne(id)
        Object.assign(plan, updateDto)
        return await this.planRepository.save(plan)
    }

    async remove(id: string) {
        const plan = await this.findOne(id)
        // Soft delete logic can be added here if needed, or simple delete
        // For now, let's just delete it, but in production consider soft delete or checking for active tenants
        return await this.planRepository.remove(plan)
    }

    async findActive() {
        return await this.planRepository.find({
            where: { isActive: true },
            order: { price: 'ASC' },
        })
    }
}
