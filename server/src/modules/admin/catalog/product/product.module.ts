import { Module } from '@nestjs/common'
import { ReviewModule } from '../review/review.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { ProductAttributeEntity } from './entities/attribute.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductVariantEntity } from './entities/variant.entity'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductRepository } from './product.repository'
import { ProductAttributeRepository } from './attribute.repository'
import { ProductVariantRepository } from './variant.repository'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { BrandRepository } from '../brand/brand.repository'

@Module({
  imports: [
    ReviewModule,
    CacheModule,
    InventoryTransactionModule,
    PurchaseModule,
    PromotionModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductAttributeRepository, ProductVariantRepository],
  exports: [ProductService, ProductRepository, ProductAttributeRepository, ProductVariantRepository],
})
export class ProductModule {}
