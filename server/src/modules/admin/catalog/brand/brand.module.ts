import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandEntity } from './entities/brand.entity'
import { BrandController } from './brand.controller'
import { BrandService } from './brand.service'
import { BrandRepository } from './brand.repository'

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity])],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
