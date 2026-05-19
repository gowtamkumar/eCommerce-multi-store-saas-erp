import { Module } from '@nestjs/common'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SubscriptionBillingController } from './subscription-billing.controller'
import { SubscriptionBillingService } from './subscription-billing.service'
import { ConfigModule } from '@nestjs/config'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [PaymentModule, ConfigModule, CacheModule, TenantModule, NotificationModule],
  controllers: [SubscriptionBillingController],
  providers: [SubscriptionBillingService],
  exports: [SubscriptionBillingService],
})
export class SubscriptionBillingModule {}
