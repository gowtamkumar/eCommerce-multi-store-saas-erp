import { Module } from '@nestjs/common'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SubscriptionBillingController } from './subscription-billing.controller'
import { SubscriptionBillingService } from './subscription-billing.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [PaymentModule, ConfigModule],
  controllers: [SubscriptionBillingController],
  providers: [SubscriptionBillingService],
  exports: [SubscriptionBillingService],
})
export class SubscriptionBillingModule { }
