import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { AdminMediaController } from './controllers/admin-media.controller';
import { FilesService } from './services/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [AdminMediaController],
  providers: [FilesService],
})
export class FileModule { }
