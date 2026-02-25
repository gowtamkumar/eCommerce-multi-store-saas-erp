import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtAuthStrategy } from 'src/common/strategies/jwt-auth.strategy'
import { TenantModule } from '../../tenant/tenant.module'
import { UserModule } from '../user/user.module'
import { AdminAuthController } from './controllers/admin-auth.controller'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'

import { MailModule } from 'src/modules/others/mail/mail.module'

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
export class AuthModule {}
