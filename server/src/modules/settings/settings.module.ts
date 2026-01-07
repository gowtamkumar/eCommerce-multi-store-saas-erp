import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SiteSettingsEntity } from './entities/site-settings.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SiteSettingsEntity])],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
