import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
// import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { CustomThrottlerGuard } from './throttler.guard'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: new ThrottlerStorageRedisService({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        }),
        throttlers: [
          {
            name: 'standard',
            ttl: 60000, // 60000 ms = 60 seconds = 1 minute
            limit: 300, // 100 requests per 1 minute
          },
          {
            name: 'sensitive',
            ttl: 60000, // 60000 ms = 60 seconds = 1 minute
            limit: 5, // 5 requests per 1 minute
          },
          {
            name: 'transactional',
            ttl: 60000, // 60000 ms = 60 seconds = 1 minute
            limit: 10, // 10 requests per 1 minute
          },
          {
            name: 'promo',
            ttl: 60000, // 60000 ms = 60 seconds = 1 minute
            limit: 15, // 15 requests per 1 minute
          },
          {
            name: 'ai',
            ttl: 60000,
            limit: 40, // store admin AI generate endpoints
          },
          {
            name: 'ai-storefront',
            ttl: 60000,
            limit: 20, // public shopping assistant chat
          },
        ],
      }),
    }),
  ],
  providers: [CustomThrottlerGuard],
  exports: [ThrottlerModule, CustomThrottlerGuard],
})
export class AppThrottlerModule {}
