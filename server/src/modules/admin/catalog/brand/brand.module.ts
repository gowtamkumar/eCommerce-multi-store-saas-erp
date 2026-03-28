import { Module } from '@nestjs/common'
import { BrandController } from './brand.controller'
import { BrandRepository } from './brand.repository'
import { BrandService } from './brand.service'

@Module({
  imports: [],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
