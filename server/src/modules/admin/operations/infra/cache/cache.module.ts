import { CacheRepository } from '@/modules/admin/operations/infra/cache/cache.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { redisStore } from 'cache-manager-redis-yet'

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        }),
        ttl: (Number(process.env.CACHE_TTL) || 300) * 1000, // default to CACHE_TTL env var or fallback to 5 min
      }),
    }),
  ],
  providers: [CacheService, CacheRepository],
  exports: [CacheService, CacheRepository],
})
export class CacheModule {}
