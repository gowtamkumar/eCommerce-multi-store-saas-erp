import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeoController } from './seo.controller'
import { SeoService } from './seo.service'
import { CategoryEntity } from '../../admin/catalog/category/entities/category.entity'
import { ProductEntity } from '../../admin/catalog/product/entities/product.entity'
import { SiteSettingsEntity } from '../../admin/settings/entities/site-settings.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, ProductEntity, SiteSettingsEntity])],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
