import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { Module } from '@nestjs/common'
import { ReviewModule } from '../review/review.module'
import { ProductAttributeRepository } from './attribute.repository'
import { ProductController } from './product.controller'
import { ProductRepository } from './product.repository'
import { ProductService } from './product.service'
import { ProductVariantRepository } from './variant.repository'

@Module({
  imports: [ReviewModule, CacheModule, InventoryTransactionModule, PurchaseModule, PromotionModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ProductAttributeRepository,
    ProductVariantRepository,
  ],
  exports: [
    ProductService,
    ProductRepository,
    ProductAttributeRepository,
    ProductVariantRepository,
  ],
})
export class ProductModule {}
