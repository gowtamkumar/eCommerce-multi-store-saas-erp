import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'
import { SubscriptionPlanRepository } from './subscription-plan.repository'
import { PublicSubscriptionPlanController } from './public-subscription-plan.controller'
import { SubscriptionPlanController } from './subscription-plan.controller'
import { SubscriptionPlanService } from './subscription-plan.service'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlanEntity]), CacheModule],
  controllers: [SubscriptionPlanController, PublicSubscriptionPlanController],
  providers: [SubscriptionPlanService, SubscriptionPlanRepository],
  exports: [SubscriptionPlanService, SubscriptionPlanRepository],
})
export class SubscriptionPlanModule {}
