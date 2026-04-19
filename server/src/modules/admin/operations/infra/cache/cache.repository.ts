import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheRepository {
  private readonly logger = new Logger(CacheRepository.name)
  
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

      // For cache-manager v7+, it uses keyv. The store is usually a Keyv instance.
      // We need to drill down to the underlying redis client.
      const underlyingStore = store.store || store._cache || store
      const client = underlyingStore.client || underlyingStore.redisClient || underlyingStore._client
      
      // If we found a client, attempt 'keys' or 'scan'
      if (client && typeof client.keys === 'function') {
        const keys = await client.keys(pattern)
        if (Array.isArray(keys) && keys.length > 0) {
          await (client.del || client.delete).call(client, ...keys)
        }
        cleared = true
      } 
      // Fallback: check if store itself has keys (for older versions or different stores)
      else if (typeof underlyingStore.keys === 'function') {
        const keys = await underlyingStore.keys(pattern)
        if (Array.isArray(keys) && keys.length > 0) {
          await (underlyingStore.del || underlyingStore.delete).call(underlyingStore, ...keys)
        }
        cleared = true
      }
    }

    if (!cleared) {
      this.logger.warn(`Pattern deletion not supported or no keys found for pattern: ${pattern}`)
      // Don't throw if no keys found, just log a warning. 
      // If you really want it to throw only when not supported:
      // throw new Error('Redis client not accessible for pattern deletion')
    }
  }
}
