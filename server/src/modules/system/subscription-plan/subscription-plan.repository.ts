import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'

@Injectable()
export class SubscriptionPlanRepository extends Repository<SubscriptionPlanEntity> {
  constructor(private dataSource: DataSource) {
    super(SubscriptionPlanEntity, dataSource.createEntityManager())
  }

  async createAndSave(data: any): Promise<SubscriptionPlanEntity> {
    const plan = this.create(data) as any
    return await this.save(plan)
  }

  async findAllSortedByPrice(): Promise<SubscriptionPlanEntity[]> {
    return await this.find({
      order: { monthlyPrice: 'ASC' },
    })
  }

  async findActiveSortedByPrice(): Promise<SubscriptionPlanEntity[]> {
    return await this.find({
      where: { isActive: true },
      order: { monthlyPrice: 'ASC' },
    })
  }

  async findById(id: string): Promise<SubscriptionPlanEntity | null> {
    return await this.findOne({ where: { id } })
  }

  async updateAndSave(plan: SubscriptionPlanEntity, data: any): Promise<SubscriptionPlanEntity> {
    Object.assign(plan, data)
    return await this.save(plan)
  }

  async removePlan(plan: SubscriptionPlanEntity): Promise<void> {
    await this.softRemove(plan)
  }
}
