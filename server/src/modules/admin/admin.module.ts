import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './Report/analytics.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, AuthModule, AnalyticsModule],
})
export class AdminModule { }
