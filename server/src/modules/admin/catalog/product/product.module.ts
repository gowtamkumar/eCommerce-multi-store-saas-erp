import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandEntity } from '../brand/entities/brand.entity'
import { CategoryEntity } from '../category/entities/category.entity'
import { ReviewModule } from '../review/review.module'
import { ProductAttributeEntity } from './entities/attribute.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductVariantEntity } from './entities/variant.entity'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { FaqEntity } from '@/modules/admin/content/faq/entities/faq.entity'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      FaqEntity,
      ProductAttributeEntity,
      ProductVariantEntity,
      CategoryEntity,
      BrandEntity,
    ]),
    ReviewModule,
    CacheModule,
    InventoryTransactionModule,
    PurchaseModule,
    PromotionModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }
