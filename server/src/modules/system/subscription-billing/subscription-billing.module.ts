import { Module } from '@nestjs/common'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SubscriptionBillingController } from './subscription-billing.controller'
import { SubscriptionBillingService } from './subscription-billing.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [PaymentModule, ConfigModule, CacheModule],
  controllers: [SubscriptionBillingController],
  providers: [SubscriptionBillingService],
  exports: [SubscriptionBillingService],
})
export class SubscriptionBillingModule {}
