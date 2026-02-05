import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '../cache/cache.module'
import { CategoryEntity } from '../category/entities/category.entity'
import { FaqEntity } from '../faq/entities/faq.entity'
import { ReviewModule } from '../review/review.module'
import { ProductAttributeEntity } from './entities/attribute.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductVariantEntity } from './entities/variant.entity'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

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
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
