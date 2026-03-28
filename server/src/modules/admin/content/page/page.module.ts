import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'
import { Module } from '@nestjs/common'
import { PageController } from './page.controller'
import { PageRepository } from './page.repository'
import { PageService } from './page.service'

@Module({
  imports: [ProductModule, FaqModule],
  controllers: [PageController],
  providers: [PageService, PageRepository],
  exports: [PageService, PageRepository],
})
export class PageModule {}
