import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandEntity } from './entities/brand.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BrandEntity])],
    controllers: [BrandController],
    providers: [BrandService],
    exports: [BrandService],
})
export class BrandModule { }
