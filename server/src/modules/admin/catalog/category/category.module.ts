import { CategoryController } from '@/modules/admin/catalog/category/category.controller'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { Module } from '@nestjs/common'
import { CategoryRepository } from './category.repository'

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
