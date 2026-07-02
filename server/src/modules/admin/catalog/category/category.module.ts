import { CategoryController } from '@/modules/admin/catalog/category/category.controller'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryEntity } from './entities/category.entity'
import { CategoryRepository } from './category.repository'

import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), StoreModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
