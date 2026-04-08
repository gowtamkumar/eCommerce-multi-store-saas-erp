import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { PromotionController } from './promotion.controller'
import { PromotionEntity } from './entities/promotion.entity'
import { PromotionRepository } from './promotion.repository'
import { PromotionService } from './promotion.service'

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity]), CacheModule, forwardRef(() => ProductModule)],
  controllers: [PromotionController],
  providers: [PromotionService, PromotionRepository],
  exports: [PromotionService],
})
export class PromotionModule {}
