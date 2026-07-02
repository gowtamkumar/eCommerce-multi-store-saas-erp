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
    this.logger.log(`Deleting keys by pattern: ${pattern}`)
    const stores = (this.cache as any).stores || [(this.cache as any).store]
    let cleared = false

    for (const store of stores) {
      if (!store) continue

      try {
        // Step 1: Try to find the underlying redis client
        // This handles cache-manager-redis-yet, keyv-redis, and older cache-manager-redis-store
        const underlyingStore = store.store || store._cache || store
        const client =
          underlyingStore.client ||
          underlyingStore.redisClient ||
          underlyingStore._client ||
          underlyingStore.instance

        if (client && typeof client.scan === 'function') {
          // Always use non-blocking SCAN (never KEYS): KEYS is O(N) and blocks
          // the single-threaded Redis server, causing latency spikes for every
          // store during cache invalidation on large keyspaces.
          this.logger.debug(`Found Redis client in store. Using non-blocking SCAN.`)
          const keys = await this.scanRecursive(client, pattern)

          if (keys.length > 0) {
            await (client.del || client.delete).call(client, ...keys)
            this.logger.log(`[CACHE] Deleted ${keys.length} keys for pattern: ${pattern}`)
          }
          cleared = true
        }
        // Step 2: Fallback if the store itself has a keys method
        else if (typeof store.keys === 'function') {
          const keys = await store.keys(pattern)
          if (Array.isArray(keys) && keys.length > 0) {
            await store.del(keys)
          }
          cleared = true
        }
      } catch (err: any) {
        this.logger.error(`Error deleting by pattern in store: ${err.message}`)
      }
    }

    if (!cleared) {
      this.logger.warn(`Pattern deletion not supported or no keys found for: ${pattern}`)
    }
  }

  private async scanRecursive(client: any, pattern: string): Promise<string[]> {
    const keys: string[] = []
    let cursor = '0'
    do {
      const [nextCursor, chunk] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = nextCursor
      keys.push(...chunk)
    } while (cursor !== '0')
    return keys
  }
}
