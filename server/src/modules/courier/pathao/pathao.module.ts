
import { Module } from '@nestjs/common';
import { SettingsModule } from '../../settings/settings.module';
import { PathaoController } from './pathao.controller';
import { PathaoService } from './pathao.service';

@Module({
  imports: [SettingsModule],
  controllers: [PathaoController],
  providers: [PathaoService],
  exports: [PathaoService],
})
export class PathaoModule {}
