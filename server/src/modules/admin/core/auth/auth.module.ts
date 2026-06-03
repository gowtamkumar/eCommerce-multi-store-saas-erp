import { JwtAuthStrategy } from '@/common/strategies/jwt-auth.strategy'
import { AdminAuthController } from '@/modules/admin/core/auth/controllers/admin-auth.controller'
import { AuthController } from '@/modules/admin/core/auth/controllers/auth.controller'
import { SessionEntity } from '@/modules/admin/core/auth/entities/session.entity'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import { RbacModule } from '@/modules/admin/core/rbac/rbac.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LoyaltyModule } from '@/modules/admin/marketing/loyalty/loyalty.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [
    UserModule,
    TenantModule,
    MailModule,
    RbacModule,
    NotificationModule,
    LoyaltyModule,
    TypeOrmModule.forFeature([SessionEntity]),
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
  exports: [AuthService],
})
export class AuthModule {}
