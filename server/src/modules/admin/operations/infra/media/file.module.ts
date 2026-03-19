import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminMediaController } from './controllers/admin-media.controller'
import { FileEntity } from './entities/file.entity'
import { FilesService } from './services/file.service'

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [AdminMediaController],
  providers: [FilesService],
})
export class FileModule {}
