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
    const data = await this.cache.get<T>(this.buildKey(key, tenantId))
    return data ?? null
  }

  async set(key: string, value: any, ttl: number = 300, tenantId?: string) {
    await this.cache.set(this.buildKey(key, tenantId), value, ttl)
  }

  async del(key: string, tenantId?: string) {
    await this.cache.del(this.buildKey(key, tenantId))
  }

  async reset() {
    await this.cache.clear()
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
