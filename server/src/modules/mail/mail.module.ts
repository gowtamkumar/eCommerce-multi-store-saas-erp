import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { TenantEntity } from '../tenant/entities/tenant.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([TenantEntity, SiteSettingsEntity]),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
