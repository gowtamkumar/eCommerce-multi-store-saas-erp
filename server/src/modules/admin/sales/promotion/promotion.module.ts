import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PromotionController } from './controllers/promotion.controller'
import { PromotionEntity } from './entities/promotion.entity'
import { PromotionRepository } from './repositories/promotion.repository'
import { PromotionService } from './services/promotion.service'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity, ProductEntity]), CacheModule, TenantModule],
  controllers: [PromotionController],
  providers: [PromotionService, PromotionRepository, ProductRepository],
  exports: [PromotionService, PromotionRepository],
})
export class PromotionModule {}
