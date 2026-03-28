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
}
