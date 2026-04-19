import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SubscriptionPlanRepository {
  constructor(
    @InjectRepository(SubscriptionPlanEntity)
    private readonly repo: Repository<SubscriptionPlanEntity>,
  ) {}

  async createAndSave(data: any, ctx: RequestContextDto): Promise<SubscriptionPlanEntity> {
    const plan = this.repo.create({ ...data, userId: ctx.userId }) as any
    return await this.repo.save(plan)
  }

  async findAllSortedByPrice(): Promise<SubscriptionPlanEntity[]> {
    return await this.repo.find({
      order: { monthlyPrice: 'ASC' },
    })
  }

  async findActiveSortedByPrice(): Promise<SubscriptionPlanEntity[]> {
    return await this.repo.find({
      where: { isActive: true },
      order: { monthlyPrice: 'ASC' },
    })
  }

  async findById(id: string): Promise<SubscriptionPlanEntity | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async updateAndSave(plan: SubscriptionPlanEntity, data: any): Promise<SubscriptionPlanEntity> {
    Object.assign(plan, data)
    return await this.repo.save(plan)
  }

  async removePlan(plan: SubscriptionPlanEntity): Promise<void> {
    await this.repo.softRemove(plan)
  }
}
