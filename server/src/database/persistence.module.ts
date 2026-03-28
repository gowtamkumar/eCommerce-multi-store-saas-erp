import { CouponEntity } from '@/modules/admin/sales/coupon/entities/coupon.entity'
import { CouponRepository } from '@/modules/admin/sales/coupon/coupon.repository'
import { FileEntity } from '@/modules/admin/operations/infra/file/entities/file.entity'
import { FileRepository } from '@/modules/admin/operations/infra/file/file.repository'
import { InventoryTransactionEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-transaction.entity'
import { InventoryTransactionRepository } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.repository'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderRepository } from '@/modules/admin/sales/order/order.repository'
import { PaymentEntity } from '@/modules/admin/sales/payment/entities/payment.entity'
import { PaymentRepository } from '@/modules/admin/sales/payment/payment.repository'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/variant.repository'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
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
    ]),
  ],
  providers: [
    TenantRepository,
    SiteSettingsRepository,
    FileRepository,
    OrderRepository,
    PaymentRepository,
    ProductRepository,
    ProductVariantRepository,
    InventoryTransactionRepository,
    CouponRepository,
  ],
  exports: [
    TenantRepository,
    SiteSettingsRepository,
    FileRepository,
    OrderRepository,
    PaymentRepository,
    ProductRepository,
    ProductVariantRepository,
    InventoryTransactionRepository,
    CouponRepository,
    TypeOrmModule,
  ],
})
export class PersistenceModule {}
