import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { CouponController } from './controllers/coupon.controller'
import { CouponEntity } from './entities/coupon.entity'
import { CouponRepository } from './repositories/coupon.repository'
import { CouponService } from './services/coupon.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity]), CacheModule, TenantModule],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService, CouponRepository],
})
export class CouponModule {}
