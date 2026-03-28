import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryController } from '@/modules/admin/catalog/category/category.controller'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { CategoryRepository } from './category.repository'

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
