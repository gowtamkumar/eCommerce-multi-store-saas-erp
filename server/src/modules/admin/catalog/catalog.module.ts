import { Module } from '@nestjs/common'
import { BrandModule } from './brand/brand.module'
import { CategoryModule } from './category/category.module'
import { ProductModule } from './product/product.module'
import { ReviewModule } from './review/review.module'
import { PricingModule } from './pricing/pricing.module'

@Module({
  imports: [BrandModule, CategoryModule, ProductModule, ReviewModule, PricingModule],
  exports: [BrandModule, CategoryModule, ProductModule, ReviewModule, PricingModule],
})
export class CatalogModule {}
