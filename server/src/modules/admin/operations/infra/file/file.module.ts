import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileEntity } from './entities/file.entity'
import { FileRepository } from './file.repository'
import { AdminMediaController } from './controllers/file.controller'
import { FilesService } from './services/file.service'
import { MinioService } from './services/minio.service'
import { StoreModule } from '@/modules/system/store/store.module'
import { AddonCatalogModule } from '@/modules/system/addon-catalog/addon-catalog.module'

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), StoreModule, AddonCatalogModule],
  controllers: [AdminMediaController],
  providers: [FilesService, MinioService, FileRepository],
  exports: [FilesService, MinioService, FileRepository],
})
export class FileModule {}
