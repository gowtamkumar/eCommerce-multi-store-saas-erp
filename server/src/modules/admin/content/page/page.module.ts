import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PageController } from './page.controller'
import { PageRepository } from './page.repository'
import { PageRevisionRepository } from './page-revision.repository'
import { PageReusableBlockController } from './page-reusable-block.controller'
import { PageReusableBlockRepository } from './page-reusable-block.repository'
import { PageReusableBlockService } from './page-reusable-block.service'
import { PageService } from './page.service'
import { StorePageController } from './store-page.controller'
import { PageEntity } from './entities/page.entity'
import { PageRevisionEntity } from './entities/page-revision.entity'
import { PageReusableBlockEntity } from './entities/page-reusable-block.entity'

import { StoreModule } from '@/modules/system/store/store.module'
import { SuperAdminCrossStoreRepository } from '@/modules/system/super-admin/repositories/super-admin-cross-store.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([PageEntity, PageRevisionEntity, PageReusableBlockEntity]),
    ProductModule,
    FaqModule,
    StoreModule,
  ],
  controllers: [PageReusableBlockController, StorePageController, PageController],
  providers: [
    PageService,
    PageReusableBlockService,
    PageRepository,
    PageRevisionRepository,
    PageReusableBlockRepository,
    SuperAdminCrossStoreRepository,
  ],
  exports: [
    PageService,
    PageReusableBlockService,
    PageRepository,
    PageRevisionRepository,
    PageReusableBlockRepository,
  ],
})
export class PageModule {}
