import { Module } from '@nestjs/common'
import { AdminMediaController } from './controllers/file.controller'
import { FilesService } from './services/file.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [AdminMediaController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FileModule {}
