import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/modules/others/mail/mail.module';
import { UserEntity } from '../admin/user/entities/user.entity';
import { SettingsModule } from '../settings/settings.module';
import { SubscriptionPlanModule } from '../system-platform/subscription-plan/subscription-plan.module';
import { TenantEntity } from './entities/tenant.entity';
import { OnboardController } from './onboard.controller';
import { TenantLookupController } from './tenant-lookup.controller';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([TenantEntity, UserEntity]),
        SettingsModule,
        MailModule,
        SubscriptionPlanModule,
    ],
    controllers: [TenantController, TenantLookupController, OnboardController],
    providers: [TenantService],
    exports: [TenantService],
})
export class TenantModule { }
