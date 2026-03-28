import { Module } from '@nestjs/common'
import { AdminMediaController } from './controllers/admin-media.controller'
import { FilesService } from './services/file.service'

@Module({
  imports: [],
  controllers: [AdminMediaController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FileModule {}
