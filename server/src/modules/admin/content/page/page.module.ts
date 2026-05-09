import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'
import { Module } from '@nestjs/common'
import { PageController } from './page.controller'
import { PageRepository } from './page.repository'
import { PageService } from './page.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [ProductModule, FaqModule, TenantModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
