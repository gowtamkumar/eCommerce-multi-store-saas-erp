import { Module } from '@nestjs/common'
import { AdminMediaController } from './controllers/file.controller'
import { FilesService } from './services/file.service'
import { MinioService } from './services/minio.service'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { AddonCatalogModule } from '@/modules/system/addon-catalog/addon-catalog.module'

@Module({
  imports: [TenantModule, AddonCatalogModule],
  controllers: [AdminMediaController],
  providers: [FilesService, MinioService],
  exports: [FilesService, MinioService],
})
export class FileModule {}
