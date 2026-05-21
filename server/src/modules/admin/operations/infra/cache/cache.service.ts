import { Injectable, Logger } from '@nestjs/common'
import { CACHE_PREFIX } from '@/common/constants/cache'
import { CacheRepository } from './cache.repository'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)

  constructor(private readonly cacheRepository: CacheRepository) {}

  private buildKey(key: string, tenantId?: string) {
    this.logger.log(`${this.buildKey.name} Service Called`)
    return tenantId ? `${CACHE_PREFIX}:tenant:${tenantId}:${key}` : `${CACHE_PREFIX}:${key}`
  }

  async getCache<T>(key: string, tenantId?: string): Promise<T | null> {
    this.logger.log(`${this.getCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      return await this.cacheRepository.get<T>(fullKey)
    } catch (error) {
      this.logger.error(`[CACHE] GET error for key ${key}:`, error.message)
      return null
    }
  }

  async setCache(key: string, value: any, ttl: number = 300, tenantId?: string) {
    this.logger.log(`${this.setCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      const ttlMs = ttl * 1000 // Convert seconds to milliseconds for cache-manager-redis-yet
      await this.cacheRepository.set(fullKey, value, ttlMs)
    } catch (error) {
      this.logger.error(`[CACHE] SET error for key ${key}:`, error.message)
    }
  }

  async delCache(key: string, tenantId?: string) {
    this.logger.log(`${this.delCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      await this.cacheRepository.del(fullKey)
    } catch (error) {
      this.logger.error(`[CACHE] DELETE error for key ${key}:`, error.message)
    }
  }

  async delCacheByPattern(pattern: string, tenantId?: string) {
    this.logger.log(`${this.delCacheByPattern.name} Service Called`)
    try {
      const fullPattern = tenantId ? `${CACHE_PREFIX}:tenant:${tenantId}:${pattern}` : `${CACHE_PREFIX}:${pattern}`
      await this.cacheRepository.delByPattern(fullPattern)
    } catch (error) {
      this.logger.error(`[CACHE] DELETE pattern error for ${pattern}:`, error.message)
    }
  }

  async resetCache() {
    this.logger.log(`${this.resetCache.name} Service Called`)
    try {
      await this.cacheRepository.clear()
    } catch (error) {
      this.logger.error('[CACHE] RESET error:', error.message)
    }
  }

  async clearTenantCache(tenantId: string) {
    this.logger.log(`${this.clearTenantCache.name} Service Called for tenant: ${tenantId}`)
    try {
      // Construction: prefix:tenant:tenantId:*
      // We need to fetch the prefix securely if possible, otherwise use constant
      const pattern = `${CACHE_PREFIX}:tenant:${tenantId}:*`
      await this.cacheRepository.delByPattern(pattern)
      this.logger.log(`[CACHE] Successfully cleared cache for tenant: ${tenantId}`)
    } catch (error) {
      this.logger.error(`[CACHE] CLEAR_TENANT error for tenant ${tenantId}:`, error.message)
      throw error
    }
  }

  async clearFullCache() {
    this.logger.log(`${this.clearFullCache.name} Service Called`)
    try {
      await this.cacheRepository.clear()
    } catch (error) {
      this.logger.error('[CACHE] CLEAR_FULL error:', error.message)
      throw error
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
