import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'
import { Module } from '@nestjs/common'
import { PageController } from './page.controller'
import { PageRepository } from './page.repository'
import { PageRevisionRepository } from './page-revision.repository'
import { PageReusableBlockController } from './page-reusable-block.controller'
import { PageReusableBlockRepository } from './page-reusable-block.repository'
import { PageReusableBlockService } from './page-reusable-block.service'
import { PageService } from './page.service'
import { StorePageController } from './store-page.controller'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [ProductModule, FaqModule, TenantModule],
  controllers: [PageReusableBlockController, StorePageController, PageController],
  providers: [PageService, PageReusableBlockService],
  exports: [PageService, PageReusableBlockService],
})
export class PageModule {}

// Repositories registered globally in PersistenceModule.
export { PageRevisionRepository, PageReusableBlockRepository }
