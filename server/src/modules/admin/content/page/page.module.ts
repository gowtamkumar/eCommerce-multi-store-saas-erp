import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PageEntity } from './entities/page.entity'
import { PageController } from './page.controller'
import { PageService } from './page.service'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity]), ProductModule, FaqModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
