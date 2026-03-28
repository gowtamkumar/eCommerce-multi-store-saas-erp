import { BrandRepository } from '@/modules/admin/catalog/brand/brand.repository'
import { BrandEntity } from '@/modules/admin/catalog/brand/entities/brand.entity'
import { CategoryRepository } from '@/modules/admin/catalog/category/category.repository'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/variant.repository'
import { ReviewEntity } from '@/modules/admin/catalog/review/entities/review.entity'
import { ReviewRepository } from '@/modules/admin/catalog/review/review.repository'
import { FaqEntity } from '@/modules/admin/content/faq/entities/faq.entity'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { PageEntity } from '@/modules/admin/content/page/entities/page.entity'
import { PageRepository } from '@/modules/admin/content/page/page.repository'
import { StaffInvitationEntity } from '@/modules/admin/core/user/entities/staff-invitation.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StaffInvitationRepository } from '@/modules/admin/core/user/repositories/staff-invitation.repository'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { LeadRepository } from '@/modules/admin/customer/lead/lead.repository'
import { SubscriberEntity } from '@/modules/admin/customer/subscriber/entities/subscriber.entity'
import { SubscriberRepository } from '@/modules/admin/customer/subscriber/subscriber.repository'
import { ExpenseEntity } from '@/modules/admin/operations/finance/expense/entities/expense.entity'
import { ExpenseRepository } from '@/modules/admin/operations/finance/expense/expense.repository'
import { InvoiceEntity } from '@/modules/admin/operations/finance/invoice/entities/invoice.entity'
import { InvoiceRepository } from '@/modules/admin/operations/finance/invoice/invoice.repository'
import { PurchaseOrderItemEntity } from '@/modules/admin/operations/finance/purchase/entities/purchase-order-item.entity'
import { PurchaseOrderEntity } from '@/modules/admin/operations/finance/purchase/entities/purchase-order.entity'
import { SupplierPaymentEntity } from '@/modules/admin/operations/finance/purchase/entities/supplier-payment.entity'
import { PurchaseOrderRepository } from '@/modules/admin/operations/finance/purchase/purchase-order.repository'
import { SupplierPaymentRepository } from '@/modules/admin/operations/finance/purchase/supplier-payment.repository'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { SupplierRepository } from '@/modules/admin/operations/finance/supplier/supplier.repository'
import { FileEntity } from '@/modules/admin/operations/infra/file/entities/file.entity'
import { FileRepository } from '@/modules/admin/operations/infra/file/file.repository'
import { InventoryTransactionEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-transaction.entity'
import { InventoryTransactionRepository } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.repository'
import { CouponRepository } from '@/modules/admin/sales/coupon/coupon.repository'
import { CouponEntity } from '@/modules/admin/sales/coupon/entities/coupon.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
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
      CategoryEntity,
      BrandEntity,
      ReviewEntity,
      FaqEntity,
      PageEntity,
      ExpenseEntity,
      InvoiceEntity,
      PurchaseOrderEntity,
      PurchaseOrderItemEntity,
      SupplierEntity,
      SupplierPaymentEntity,
      SubscriberEntity,
      StaffInvitationEntity,
    ]),
  ],
  providers: [
    TenantRepository,
    SiteSettingsRepository,
    FileRepository,
    LeadRepository,
    CategoryRepository,
    BrandRepository,
    ReviewRepository,
    FaqRepository,
    PageRepository,
    ExpenseRepository,
    InvoiceRepository,
    PurchaseOrderRepository,
    SupplierRepository,
    SupplierPaymentRepository,
    SubscriberRepository,
    StaffInvitationRepository,
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
    CategoryRepository,
    BrandRepository,
    ReviewRepository,
    FaqRepository,
    PageRepository,
    ExpenseRepository,
    InvoiceRepository,
    PurchaseOrderRepository,
    SupplierRepository,
    SupplierPaymentRepository,
    SubscriberRepository,
    StaffInvitationRepository,
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
