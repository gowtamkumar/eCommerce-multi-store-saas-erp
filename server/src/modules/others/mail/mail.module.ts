import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSettingsEntity } from 'src/modules/settings/entities/site-settings.entity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import { MailService } from './mail.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([TenantEntity, SiteSettingsEntity]),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
