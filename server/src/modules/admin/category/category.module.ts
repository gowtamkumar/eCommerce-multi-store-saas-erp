import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from '@/modules/admin/category/category.controller';
import { CategoryService } from '@/modules/admin/category/category.service';
import { CategoryEntity } from '@/modules/admin/category/entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoryEntity])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule { }
