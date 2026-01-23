import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [UserModule, AuthModule, AnalyticsModule],
})
export class AdminModule { }
