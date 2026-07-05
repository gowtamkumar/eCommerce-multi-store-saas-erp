import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SubscriptionBillingController } from './subscription-billing.controller'
import { SubscriptionBillingService } from './subscription-billing.service'
import { ConfigModule } from '@nestjs/config'
import { StoreModule } from '@/modules/system/store/store.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { AddonCatalogModule } from '@/modules/system/addon-catalog/addon-catalog.module'
import { SubscriptionPlanModule } from '@/modules/system/subscription-plan/subscription-plan.module'
import { StoreSubscriptionEntity } from '@/modules/system/store/entities/store-subscription.entity'
import { StoreSubscriptionRepository } from './repositories/store-subscription.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionInvoiceEntity, StoreSubscriptionEntity]),
    PaymentModule,
    ConfigModule,
    CacheModule,
    StoreModule,
    NotificationModule,
    AddonCatalogModule,
    SubscriptionPlanModule,
  ],
  controllers: [SubscriptionBillingController],
  providers: [SubscriptionBillingService, SubscriptionInvoiceRepository, StoreSubscriptionRepository],
  exports: [SubscriptionBillingService, SubscriptionInvoiceRepository, StoreSubscriptionRepository],
})
export class SubscriptionBillingModule {}
