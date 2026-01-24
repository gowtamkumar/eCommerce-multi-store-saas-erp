import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { OnboardController } from './onboard.controller';
import { TenantLookupController } from './tenant-lookup.controller';
import { TenantService } from './tenant.service';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from '../admin/user/entities/user.entity';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from '../mail/mail.module';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module';

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
