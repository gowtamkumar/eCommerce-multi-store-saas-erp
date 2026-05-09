import { Module } from '@nestjs/common'
import { BrandController } from './brand.controller'
import { BrandRepository } from './brand.repository'
import { BrandService } from './brand.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
