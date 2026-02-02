import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/report.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, AuthModule, ReportModule],
})
export class AdminModule { }
