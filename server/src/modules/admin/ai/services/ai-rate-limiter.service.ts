import { AiProviderType } from '@/common/types/store-ai-config.types'
import { Injectable, Logger } from '@nestjs/common'

interface ProviderLimit {
  maxRpm: number
  maxTpm: number
}

interface SlidingWindow {
  timestamps: number[]
  tokenCount: number
}

const PROVIDER_LIMITS: Record<string, ProviderLimit> = {
  [AiProviderType.OPENAI]: { maxRpm: 60, maxTpm: 100_000 },
  [AiProviderType.OPENROUTER]: { maxRpm: 60, maxTpm: 100_000 },
  [AiProviderType.ANTHROPIC]: { maxRpm: 30, maxTpm: 80_000 },
  [AiProviderType.GOOGLE]: { maxRpm: 30, maxTpm: 60_000 },
}

const PROVIDER_DEFAULT_LIMITS: ProviderLimit = { maxRpm: 60, maxTpm: 100_000 }

const WINDOW_MS = 60_000

@Injectable()
export class AiRateLimiterService {
  private readonly logger = new Logger(AiRateLimiterService.name)
  private windows = new Map<string, SlidingWindow>()

  getLimits(provider: string): ProviderLimit {
    return PROVIDER_LIMITS[provider] ?? PROVIDER_DEFAULT_LIMITS
  }

  check(provider: string, estimatedTokens: number): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now()
    const key = provider
    const limits = this.getLimits(provider)

    let window = this.windows.get(key)
    if (!window) {
      window = { timestamps: [], tokenCount: 0 }
      this.windows.set(key, window)
    }

    this.evictExpired(window, now)

    if (window.timestamps.length >= limits.maxRpm) {
      const oldest = window.timestamps[0]
      return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) }
    }

    if (window.tokenCount + estimatedTokens > limits.maxTpm) {
      return {
        allowed: false,
        retryAfterMs: Math.max(
          1000,
          ((window.tokenCount + estimatedTokens - limits.maxTpm) / limits.maxTpm) * WINDOW_MS,
        ),
      }
    }

    return { allowed: true }
  }

  record(provider: string, tokens: number): void {
    const now = Date.now()
    const key = provider

    let window = this.windows.get(key)
    if (!window) {
      window = { timestamps: [], tokenCount: 0 }
      this.windows.set(key, window)
    }

    this.evictExpired(window, now)
    window.timestamps.push(now)
    window.tokenCount += tokens
  }

  recordError(provider: string): void {
    const now = Date.now()
    const key = provider

    let window = this.windows.get(key)
    if (!window) {
      window = { timestamps: [], tokenCount: 0 }
      this.windows.set(key, window)
    }

    this.evictExpired(window, now)
    window.timestamps.push(now)
  }

  private evictExpired(window: SlidingWindow, now: number): void {
    const cutoff = now - WINDOW_MS
    window.timestamps = window.timestamps.filter((t) => t > cutoff)
  }

  reset(provider?: string): void {
    if (provider) {
      this.windows.delete(provider)
    } else {
      this.windows.clear()
    }
  }
}
