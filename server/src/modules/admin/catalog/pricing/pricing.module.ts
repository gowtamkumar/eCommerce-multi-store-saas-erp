import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PriceBookEntity } from './entities/price-book.entity'
import { ProductPriceEntity } from './entities/product-price.entity'
import { PricingService } from './pricing.service'
import { PricingController } from './pricing.controller'
import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [TypeOrmModule.forFeature([PriceBookEntity, ProductPriceEntity]), StoreModule],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
