import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandEntity } from './entities/brand.entity'
import { BrandController } from './brand.controller'
import { BrandRepository } from './brand.repository'
import { BrandService } from './brand.service'

import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity]), StoreModule],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
