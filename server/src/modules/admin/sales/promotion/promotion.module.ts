import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PromotionController } from './controllers/promotion.controller'
import { PromotionEntity } from './entities/promotion.entity'
import { PromotionRepository } from './repositories/promotion.repository'
import { PromotionService } from './services/promotion.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PromotionEntity]),
    CacheModule,
    TenantModule,
  ],
  controllers: [PromotionController],
  providers: [PromotionService, PromotionRepository],
  exports: [PromotionService],
})
export class PromotionModule {}
