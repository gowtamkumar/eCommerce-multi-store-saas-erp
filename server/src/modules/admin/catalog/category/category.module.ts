import { CategoryController } from '@/modules/admin/catalog/category/category.controller'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryEntity } from './entities/category.entity'
import { CategoryRepository } from './category.repository'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), TenantModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
