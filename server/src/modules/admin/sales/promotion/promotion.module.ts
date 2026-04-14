import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { PromotionController } from './controllers/promotion.controller'
import { PromotionEntity } from './entities/promotion.entity'
import { PromotionRepository } from './repositories/promotion.repository'
import { PromotionService } from './services/promotion.service'

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity]), CacheModule, forwardRef(() => ProductModule)],
  controllers: [PromotionController],
  providers: [PromotionService, PromotionRepository],
  exports: [PromotionService],
})
export class PromotionModule { }
