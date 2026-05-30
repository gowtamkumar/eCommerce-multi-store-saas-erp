import { Module } from '@nestjs/common'
import { PublicSubscriptionPlanController } from './public-subscription-plan.controller'
import { SubscriptionPlanController } from './subscription-plan.controller'
import { SubscriptionPlanService } from './subscription-plan.service'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'

@Module({
  imports: [CacheModule],
  controllers: [SubscriptionPlanController, PublicSubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
