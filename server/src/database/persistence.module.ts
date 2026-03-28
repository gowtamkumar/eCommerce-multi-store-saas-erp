import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/variant.repository'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { FileEntity } from '@/modules/admin/operations/infra/file/entities/file.entity'
import { FileRepository } from '@/modules/admin/operations/infra/file/file.repository'
import { InventoryTransactionEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-transaction.entity'
import { InventoryTransactionRepository } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.repository'
import { CouponRepository } from '@/modules/admin/sales/coupon/coupon.repository'
import { CouponEntity } from '@/modules/admin/sales/coupon/entities/coupon.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { LeadRepository } from '@/modules/admin/customer/lead/lead.repository'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderReturnRepository } from '@/modules/admin/sales/order/order-return.repository'
import { OrderRepository } from '@/modules/admin/sales/order/order.repository'
import { PaymentEntity } from '@/modules/admin/sales/payment/entities/payment.entity'
import { PaymentRepository } from '@/modules/admin/sales/payment/payment.repository'
import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity'
import { PromotionRepository } from '@/modules/admin/sales/promotion/promotion.repository'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
import { CartItemRepository } from '@/modules/store/cart/cart-item.repository'
import { CartRepository } from '@/modules/store/cart/cart.repository'
import { CartItemEntity } from '@/modules/store/cart/entities/cart-item.entity'
import { CartEntity } from '@/modules/store/cart/entities/cart.entity'
import { ShippingAddressEntity } from '@/modules/store/shipping-address/entities/shipping-address.entity'
import { ShippingAddressRepository } from '@/modules/store/shipping-address/shipping-address.repository'
import { AuditLogRepository } from '@/modules/system/audit-log/audit-log.repository'
import { AuditLogEntity } from '@/modules/system/audit-log/entities/audit-log.entity'
import { PlatformSettingsEntity } from '@/modules/system/platform/entities/platform-settings.entity'
import { PlatformSettingsRepository } from '@/modules/system/platform/platform-settings.repository'
import { SubscriptionInvoiceEntity } from '@/modules/system/subscription-billing/entities/subscription-invoice.entity'
import { SubscriptionInvoiceRepository } from '@/modules/system/subscription-billing/subscription-invoice.repository'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { SubscriptionPlanRepository } from '@/modules/system/subscription-plan/subscription-plan.repository'
import { TenantTrafficEntity } from '@/modules/system/tenant-traffic/entities/tenant-traffic.entity'
import { TrafficRepository } from '@/modules/system/tenant-traffic/traffic.repository'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      SiteSettingsEntity,
      FileEntity,
      OrderEntity,
      PaymentEntity,
      ProductEntity,
      ProductVariantEntity,
      InventoryTransactionEntity,
      CouponEntity,
      OrderItemEntity,
      PromotionEntity,
      UserEntity,
      CartEntity,
      CartItemEntity,
      ShippingAddressEntity,
      AuditLogEntity,
      PlatformSettingsEntity,
      SubscriptionPlanEntity,
      SubscriptionInvoiceEntity,
      TenantTrafficEntity,
      LeadEntity,
    ]),
  ],
  providers: [
    TenantRepository,
    SiteSettingsRepository,
    FileRepository,
    LeadRepository,
    OrderRepository,
    PaymentRepository,
    ProductRepository,
    ProductVariantRepository,
    InventoryTransactionRepository,
    CouponRepository,
    OrderReturnRepository,
    PromotionRepository,
    UserRepository,
    CartRepository,
    CartItemRepository,
    ShippingAddressRepository,
    AuditLogRepository,
    PlatformSettingsRepository,
    SubscriptionPlanRepository,
    SubscriptionInvoiceRepository,
    TrafficRepository,
  ],
  exports: [
    TenantRepository,
    SiteSettingsRepository,
    FileRepository,
    LeadRepository,
    OrderRepository,
    PaymentRepository,
    ProductRepository,
    ProductVariantRepository,
    InventoryTransactionRepository,
    CouponRepository,
    OrderReturnRepository,
    PromotionRepository,
    UserRepository,
    CartRepository,
    CartItemRepository,
    ShippingAddressRepository,
    AuditLogRepository,
    PlatformSettingsRepository,
    SubscriptionPlanRepository,
    SubscriptionInvoiceRepository,
    TrafficRepository,
    TypeOrmModule,
  ],
})
export class PersistenceModule {}
