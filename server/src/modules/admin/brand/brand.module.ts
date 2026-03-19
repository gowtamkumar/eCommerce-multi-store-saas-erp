import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandController } from '@/modules/admin/brand/brand.controller';
import { BrandService } from '@/modules/admin/brand/brand.service';
import { BrandEntity } from '@/modules/admin/brand/entities/brand.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BrandEntity])],
    controllers: [BrandController],
    providers: [BrandService],
    exports: [BrandService],
})
export class BrandModule { }
