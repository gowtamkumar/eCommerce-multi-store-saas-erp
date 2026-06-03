import { CACHE_PREFIX } from '@/common/constants/cache'
import { Injectable, Logger } from '@nestjs/common'
import { CacheRepository } from './cache.repository'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)

  constructor(private readonly cacheRepository: CacheRepository) {}

  private isExcluded(key: string): boolean {
    const lowerKey = key.toLowerCase()
    const excludedKeywords = [
      // POS Checkout Tenders
      'pos',
      'shift',
      'drawer',
      'tender',
      'z-report',
      'zreport',

      // Customer Carts
      'cart',
      'checkout',

      // Real-time Stock Checks
      'atp',
      'stock-check',
      'stockcheck',
      'stock-level',

      // Auth Routes
      'otp',
      'verification',
      'email-token',
      'email_token',
      'reset-password',
      'forgot-password',
      'auth-route',
    ]

    return excludedKeywords.some((keyword) => {
      if (keyword === 'token') {
        return (
          lowerKey.includes('verification') ||
          lowerKey.includes('email') ||
          lowerKey.includes('auth')
        )
      }
      return lowerKey.includes(keyword)
    })
  }

  private buildKey(key: string, tenantId?: string) {
    this.logger.log(`${this.buildKey.name} Service Called`)
    return tenantId ? `${CACHE_PREFIX}:tenant:${tenantId}:${key}` : `${CACHE_PREFIX}:${key}`
  }

  async getCache<T>(key: string, tenantId?: string): Promise<T | null> {
    this.logger.log(`${this.getCache.name} Service Called`)
    if (this.isExcluded(key)) {
      this.logger.warn(`[CACHE] GET blocked for strictly excluded real-time key: ${key}`)
      return null
    }
    try {
      const fullKey = this.buildKey(key, tenantId)
      return await this.cacheRepository.get<T>(fullKey)
    } catch (error: any) {
      this.logger.error(`[CACHE] GET error for key ${key}:`, error.message)
      return null
    }
  }

  async setCache(key: string, value: any, ttl?: number, tenantId?: string) {
    this.logger.log(`${this.setCache.name} Service Called`)
    if (this.isExcluded(key)) {
      this.logger.warn(`[CACHE] SET blocked for strictly excluded real-time key: ${key}`)
      return
    }
    try {
      const fullKey = this.buildKey(key, tenantId)
      const targetTtl = ttl !== undefined ? ttl : Number(process.env.CACHE_TTL) || 300
      const ttlMs = targetTtl * 1000 // Convert seconds to milliseconds for cache-manager-redis-yet
      await this.cacheRepository.set(fullKey, value, ttlMs)
    } catch (error: any) {
      this.logger.error(`[CACHE] SET error for key ${key}:`, error.message)
    }
  }

  async delCache(key: string, tenantId?: string) {
    this.logger.log(`${this.delCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, tenantId)
      await this.cacheRepository.del(fullKey)
    } catch (error: any) {
      this.logger.error(`[CACHE] DELETE error for key ${key}:`, error.message)
    }
  }

  async delCacheByPattern(pattern: string, tenantId?: string) {
    this.logger.log(`${this.delCacheByPattern.name} Service Called`)
    try {
      const fullPattern = tenantId
        ? `${CACHE_PREFIX}:tenant:${tenantId}:${pattern}`
        : `${CACHE_PREFIX}:${pattern}`
      await this.cacheRepository.delByPattern(fullPattern)
    } catch (error: any) {
      this.logger.error(`[CACHE] DELETE pattern error for ${pattern}:`, error.message)
    }
  }

  async resetCache() {
    this.logger.log(`${this.resetCache.name} Service Called`)
    try {
      await this.cacheRepository.clear()
    } catch (error: any) {
      this.logger.error('[CACHE] RESET error:', error.message)
    }
  }

  async clearTenantCache(tenantId: string) {
    this.logger.log(`${this.clearTenantCache.name} Service Called for tenant: ${tenantId}`)
    try {
      // 1. Clear standard tenant-scoped data cache (pages, catalogs, settings)
      const dataPattern = `${CACHE_PREFIX}:tenant:${tenantId}:*`
      await this.cacheRepository.delByPattern(dataPattern)

      // 2. Clear tenant-scoped user permissions manifest cache
      const manifestPattern = `${CACHE_PREFIX}:rbac:manifest:${tenantId}:*`
      await this.cacheRepository.delByPattern(manifestPattern)

      this.logger.log(`[CACHE] Successfully cleared cache for tenant: ${tenantId}`)
    } catch (error: any) {
      this.logger.error(`[CACHE] CLEAR_TENANT error for tenant ${tenantId}:`, error.message)
      throw error
    }
  }

  async clearFullCache() {
    this.logger.log(`${this.clearFullCache.name} Service Called`)
    try {
      await this.cacheRepository.clear()
    } catch (error: any) {
      this.logger.error('[CACHE] CLEAR_FULL error:', error.message)
      throw error
    }
  }

  /**
   * Ping the cache backend (Redis) to check connectivity.
   * Throws if the cache is unreachable.
   */
  async pingCache(): Promise<boolean> {
    const testKey = `${CACHE_PREFIX}:health:ping`
    await this.cacheRepository.set(testKey, 1, 5000)
    const val = await this.cacheRepository.get<number>(testKey)
    await this.cacheRepository.del(testKey)
    if (val === null) throw new Error('Redis ping failed')
    return true
  }

  // Smart "remember" helper
  async rememberCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    tenantId?: string,
  ): Promise<T> {
    this.logger.log(`${this.rememberCache.name} Service Called`)
    if (this.isExcluded(key)) {
      this.logger.warn(`[CACHE] REMEMBER bypassed for strictly excluded real-time key: ${key}`)
      return await fetcher()
    }
    const cached = await this.getCache<T>(key, tenantId)
    if (cached) return cached

    const fresh = await fetcher()
    await this.setCache(key, fresh, ttl, tenantId)
    return fresh
  }
}
