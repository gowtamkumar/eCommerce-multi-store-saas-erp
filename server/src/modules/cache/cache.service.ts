import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CACHE_PREFIX } from 'src/common/constants/cache.'

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  private buildKey(key: string, tenantId?: string) {
    return tenantId ? `${CACHE_PREFIX}:tenant:${tenantId}:${key}` : `${CACHE_PREFIX}:${key}`
  }

  async get<T>(key: string, tenantId?: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, tenantId)
      const data = await this.cache.get<T>(fullKey)
      return data ?? null
    } catch (error) {
      return null
    }
  }

  async set(key: string, value: any, ttl: number = 300, tenantId?: string) {
    try {
      const fullKey = this.buildKey(key, tenantId)
      const ttlMs = ttl * 1000 // Convert seconds to milliseconds for cache-manager-redis-yet
      await this.cache.set(fullKey, value, ttlMs)
    } catch (error) {
      console.error('[CACHE] SET error:', error.message, error.stack)
    }
  }

  async del(key: string, tenantId?: string) {
    try {
      const fullKey = this.buildKey(key, tenantId)
      await this.cache.del(fullKey)
    } catch (error) {
      console.error('[CACHE] DELETE error:', error.message)
    }
  }

  async reset() {
    try {
      await this.cache.clear()
    } catch (error) {
      console.error('[CACHE] RESET error:', error.message)
    }
  }

  // Smart "remember" helper
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300,
    tenantId?: string,
  ): Promise<T> {
    const cached = await this.get<T>(key, tenantId)
    if (cached) return cached

    const fresh = await fetcher()
    await this.set(key, fresh, ttl, tenantId)
    return fresh
  }
}
