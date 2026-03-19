import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtAuthStrategy } from '@/common/strategies/jwt-auth.strategy'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { AdminAuthController } from '@/modules/admin/core/auth/controllers/admin-auth.controller'
import { AuthController } from '@/modules/admin/core/auth/controllers/auth.controller'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'

import { MailModule } from '@/modules/admin/others/mail/mail.module'

@Module({
  imports: [
    UserModule,
    TenantModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES') },
      }),
    }),
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [AuthService, JwtAuthStrategy],
  exports: [],
})
export class AuthModule { }
