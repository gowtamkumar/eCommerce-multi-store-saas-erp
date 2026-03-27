import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity'
import { PublicSubscriptionPlanController } from './public-subscription-plan.controller'
import { SubscriptionPlanController } from './subscription-plan.controller'
import { SubscriptionPlanService } from './subscription-plan.service'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlanEntity])],
  controllers: [SubscriptionPlanController, PublicSubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
