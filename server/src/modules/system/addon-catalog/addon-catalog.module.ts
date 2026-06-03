import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { AddonCatalogEntity } from './entities/addon-catalog.entity'
import { AddonCatalogRepository } from './addon-catalog.repository'
import { AddonCatalogService } from './addon-catalog.service'

@Module({
  imports: [TypeOrmModule.forFeature([AddonCatalogEntity]), CacheModule],
  providers: [AddonCatalogRepository, AddonCatalogService],
  exports: [AddonCatalogService],
})
export class AddonCatalogModule {}
