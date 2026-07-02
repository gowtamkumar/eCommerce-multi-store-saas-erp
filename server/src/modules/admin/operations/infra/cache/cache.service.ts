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

  private buildKey(key: string, storeId?: string) {
    this.logger.log(`${this.buildKey.name} Service Called`)
    return storeId ? `${CACHE_PREFIX}:store:${storeId}:${key}` : `${CACHE_PREFIX}:${key}`
  }

  async getCache<T>(key: string, storeId?: string): Promise<T | null> {
    this.logger.log(`${this.getCache.name} Service Called`)
    if (this.isExcluded(key)) {
      this.logger.warn(`[CACHE] GET blocked for strictly excluded real-time key: ${key}`)
      return null
    }
    try {
      const fullKey = this.buildKey(key, storeId)
      return await this.cacheRepository.get<T>(fullKey)
    } catch (error: any) {
      this.logger.error(`[CACHE] GET error for key ${key}:`, error.message)
      return null
    }
  }

  async setCache(key: string, value: any, ttl?: number, storeId?: string) {
    this.logger.log(`${this.setCache.name} Service Called`)
    if (this.isExcluded(key)) {
      this.logger.warn(`[CACHE] SET blocked for strictly excluded real-time key: ${key}`)
      return
    }
    try {
      const fullKey = this.buildKey(key, storeId)
      const targetTtl = ttl !== undefined ? ttl : Number(process.env.CACHE_TTL) || 300
      const ttlMs = targetTtl * 1000 // Convert seconds to milliseconds for cache-manager-redis-yet
      await this.cacheRepository.set(fullKey, value, ttlMs)
    } catch (error: any) {
      this.logger.error(`[CACHE] SET error for key ${key}:`, error.message)
    }
  }

  async delCache(key: string, storeId?: string) {
    this.logger.log(`${this.delCache.name} Service Called`)
    try {
      const fullKey = this.buildKey(key, storeId)
      await this.cacheRepository.del(fullKey)
    } catch (error: any) {
      this.logger.error(`[CACHE] DELETE error for key ${key}:`, error.message)
    }
  }

  async delCacheByPattern(pattern: string, storeId?: string) {
    this.logger.log(`${this.delCacheByPattern.name} Service Called`)
    try {
      const fullPattern = storeId
        ? `${CACHE_PREFIX}:store:${storeId}:${pattern}`
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

  async clearStoreCache(storeId: string) {
    this.logger.log(`${this.clearStoreCache.name} Service Called for store: ${storeId}`)
    try {
      // 1. Clear standard store-scoped data cache (pages, catalogs, settings)
      const dataPattern = `${CACHE_PREFIX}:store:${storeId}:*`
      await this.cacheRepository.delByPattern(dataPattern)

      // 2. Clear store-scoped user permissions manifest cache
      const manifestPattern = `${CACHE_PREFIX}:rbac:manifest:${storeId}:*`
      await this.cacheRepository.delByPattern(manifestPattern)

      this.logger.log(`[CACHE] Successfully cleared cache for store: ${storeId}`)
    } catch (error: any) {
      this.logger.error(`[CACHE] CLEAR_STORE error for store ${storeId}:`, error.message)
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
    storeId?: string,
  ): Promise<T> {
    this.logger.log(`${this.rememberCache.name} Service Called`)
    if (this.isExcluded(key)) {
      this.logger.warn(`[CACHE] REMEMBER bypassed for strictly excluded real-time key: ${key}`)
      return await fetcher()
    }
    const cached = await this.getCache<T>(key, storeId)
    // Use an explicit null/undefined check so legitimately falsy cached values
    // (0, false, '', empty arrays/objects) are served from cache instead of
    // being recomputed on every request.
    if (cached !== null && cached !== undefined) return cached

    const fresh = await fetcher()
    await this.setCache(key, fresh, ttl, storeId)
    return fresh
  }
}
