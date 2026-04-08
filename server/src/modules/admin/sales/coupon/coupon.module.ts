import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { CouponController } from './coupon.controller'
import { CouponEntity } from './entities/coupon.entity'
import { CouponRepository } from './coupon.repository'
import { CouponService } from './coupon.service'

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity]), CacheModule],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService],
})
export class CouponModule {}
