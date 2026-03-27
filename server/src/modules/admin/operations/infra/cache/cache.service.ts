import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CACHE_PREFIX } from '@/common/constants/cache.'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  private buildKey(key: string, tenantId?: string) {
    this.logger.log(`${this.buildKey.name} Service Called`)
    return tenantId ? `${CACHE_PREFIX}:tenant:${tenantId}:${key}` : `${CACHE_PREFIX}:${key}`
  }

  async getCache<T>(key: string, tenantId?: string): Promise<T | null> {
    this.logger.log(`${this.getCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      const data = await this.cache.get<T>(fullKey)
      return data ?? null
    } catch (error) {
      return null
    }
  }

  async setCache(key: string, value: any, ttl: number = 300, tenantId?: string) {
    this.logger.log(`${this.setCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      const ttlMs = ttl * 1000 // Convert seconds to milliseconds for cache-manager-redis-yet
      await this.cache.set(fullKey, value, ttlMs)
    } catch (error) {
      console.error('[CACHE] SET error:', error.message, error.stack)
    }
  }

  async delCache(key: string, tenantId?: string) {
    this.logger.log(`${this.delCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      await this.cache.del(fullKey)
    } catch (error) {
      console.error('[CACHE] DELETE error:', error.message)
    }
  }

  async resetCache() {
    this.logger.log(`${this.resetCache.name} Service Called`)
    try {
      await this.cache.clear()
    } catch (error) {
      console.error('[CACHE] RESET error:', error.message)
    }
  }

  // Smart "remember" helper
  async rememberCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300,
    tenantId?: string,
  ): Promise<T> {
    this.logger.log(`${this.rememberCache.name} Service Called`)
    const cached = await this.getCache<T>(key, tenantId)
    if (cached) return cached

    const fresh = await fetcher()
    await this.setCache(key, fresh, ttl, tenantId)
    return fresh
  }
}
