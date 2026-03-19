import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryEntity } from '../category/entities/category.entity'
import { FaqEntity } from '../faq/entities/faq.entity'
import { CacheModule } from '../others/cache/cache.module'
import { ReviewModule } from '../review/review.module'
import { ProductAttributeEntity } from './entities/attribute.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductVariantEntity } from './entities/variant.entity'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { InventoryTransactionModule } from '../others/inventory-transaction/inventory-transaction.module'
import { PurchaseModule } from '../others/purchase/purchase.module'
import { PromotionModule } from '../promotion/promotion.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      FaqEntity,
      ProductAttributeEntity,
      ProductVariantEntity,
      CategoryEntity,
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
