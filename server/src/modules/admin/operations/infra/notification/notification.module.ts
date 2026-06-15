import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationEntity } from './entities/notification.entity'
import { NotificationController } from './notification.controller'
import { NotificationGateway } from './notification.gateway'
import { NotificationService } from './notification.service'
import { getJwtSecret } from '@/common/utils/jwt-secret.util'

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES') || '15m' },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
