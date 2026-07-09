import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PriceBookEntity } from './entities/price-book.entity'
import { ProductPriceEntity } from './entities/product-price.entity'
import { PricingService } from './pricing.service'
import { PricingController } from './pricing.controller'
import { StoreModule } from '@/modules/system/store/store.module'
import { PriceBookRepository } from './repositories/price-book.repository'
import { ProductPriceRepository } from './repositories/product-price.repository'

@Module({
  imports: [TypeOrmModule.forFeature([PriceBookEntity, ProductPriceEntity]), StoreModule],
  controllers: [PricingController],
  providers: [PricingService, PriceBookRepository, ProductPriceRepository],
  exports: [PricingService],
})
export class PricingModule {}
