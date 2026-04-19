import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheRepository {
  
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.cache.get<T>(key)
    return data ?? null
  }

  async set(key: string, value: any, ttlMs: number): Promise<void> {
    await this.cache.set(key, value, ttlMs)
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key)
  }

  async clear(): Promise<void> {
    await this.cache.clear()
  }

  async delByPattern(pattern: string): Promise<void> {
    const stores = (this.cache as any).stores || [(this.cache as any).store]    
    let cleared = false

    for (const store of stores) {
      if (!store) continue

      // Discover keys and del methods
      // Latest cache-manager (v7) wraps stores in Keyv.
      // cache-manager-redis-yet (v5) has a .client property or .keys() method.
      const underlyingStore = store.store || store._cache || store
      const client = underlyingStore.client || underlyingStore._client || underlyingStore.redisClient
      const keysMethod = underlyingStore.keys || client?.keys
      const delMethod = client?.del || underlyingStore.del || underlyingStore.delete || store.del || store.delete

      if (typeof keysMethod === 'function') {
        const keys = await keysMethod.call(underlyingStore.keys ? underlyingStore : client, pattern)
        if (Array.isArray(keys) && keys.length > 0) {
          // Some clients (like node-redis) allow passing an array to del
          await delMethod.call(client?.del ? client : underlyingStore, keys)
        }
        cleared = true
      }
    }

    if (!cleared) {
      throw new Error('Redis client not accessible for pattern deletion')
    }
  }
}
