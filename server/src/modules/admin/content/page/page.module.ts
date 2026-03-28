import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PageEntity } from './entities/page.entity'
import { PageController } from './page.controller'
import { PageService } from './page.service'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'
import { PageRepository } from './page.repository'

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity]), ProductModule, FaqModule],
  controllers: [PageController],
  providers: [PageService, PageRepository],
  exports: [PageService, PageRepository],
})
export class PageModule {}
