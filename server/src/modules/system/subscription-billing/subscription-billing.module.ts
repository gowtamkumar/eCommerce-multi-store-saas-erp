import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SubscriptionBillingController } from './subscription-billing.controller'
import { SubscriptionBillingService } from './subscription-billing.service'
import { ConfigModule } from '@nestjs/config'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { AddonCatalogModule } from '@/modules/system/addon-catalog/addon-catalog.module'
import { SubscriptionPlanModule } from '@/modules/system/subscription-plan/subscription-plan.module'
import { TenantSubscriptionEntity } from '@/modules/system/tenant/entities/tenant-subscription.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionInvoiceEntity, TenantSubscriptionEntity]),
    PaymentModule,
    ConfigModule,
    CacheModule,
    TenantModule,
    NotificationModule,
    AddonCatalogModule,
    SubscriptionPlanModule,
  ],
  controllers: [SubscriptionBillingController],
  providers: [SubscriptionBillingService, SubscriptionInvoiceRepository],
  exports: [SubscriptionBillingService, SubscriptionInvoiceRepository],
})
export class SubscriptionBillingModule {}
