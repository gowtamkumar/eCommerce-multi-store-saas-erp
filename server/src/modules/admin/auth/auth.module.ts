import { Inject, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '../user/user.module'
import { TenantModule } from '../../tenant/tenant.module'
import { AuthController } from './controllers/auth.controller'
import { AdminAuthController } from './controllers/admin-auth.controller'
import { AuthService } from './services/auth.service'
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { MailModule } from '../../mail/mail.module'

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
        signOptions: { expiresIn: configService.get('JWT_EXPIRES') },
      }),
    }),
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [AuthService, JwtAuthStrategy],
  exports: [],
})
export class AuthModule { }
