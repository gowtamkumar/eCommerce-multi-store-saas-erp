import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'
import { CacheService } from './cache.service'

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      ttl: 300, // default 5 min
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
