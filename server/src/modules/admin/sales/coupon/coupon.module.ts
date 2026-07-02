import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { CouponController } from './controllers/coupon.controller'
import { CouponEntity } from './entities/coupon.entity'
import { CouponRepository } from './repositories/coupon.repository'
import { CouponService } from './services/coupon.service'

import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity]), CacheModule, StoreModule],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService, CouponRepository],
})
export class CouponModule {}
