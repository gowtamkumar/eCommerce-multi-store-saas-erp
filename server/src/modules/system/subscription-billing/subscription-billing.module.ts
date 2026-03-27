import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SubscriptionBillingController } from './subscription-billing.controller'
import { SubscriptionBillingService } from './subscription-billing.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionInvoiceEntity,
      TenantEntity,
      SubscriptionPlanEntity
    ]),
    PaymentModule
  ],
  controllers: [SubscriptionBillingController],
  providers: [SubscriptionBillingService],
  exports: [SubscriptionBillingService],
})
export class SubscriptionBillingModule { }
