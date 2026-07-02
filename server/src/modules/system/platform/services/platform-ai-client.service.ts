import { AiProviderType } from '@/common/types/store-ai-config.types'
import { PlatformSettingsService } from '../platform-settings.service'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { mapAiProviderError } from '@/modules/admin/ai/utils/map-ai-provider-error.util'
import {
  isPlatformAiProviderReady,
  normalizePlatformAiConfig,
  resolvePlatformAiConfigFromEnv,
} from '../utils/platform-ai.util'
import { PlatformAiConfig } from '@/common/types/platform-ai-config.types'

export interface PlatformAiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PlatformAiCompletionResult {
  content: string
  model: string
  totalTokens: number
}

@Injectable()
export class PlatformAiClientService {
  private readonly logger = new Logger(PlatformAiClientService.name)

  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly configService: ConfigService,
  ) {}

  async isConfigured(): Promise<boolean> {
    if (await this.platformSettingsService.isPlatformAiReady()) {
      return true
    }

    return Boolean(this.getEnvFallbackConfig())
  }

  private getEnvFallbackConfig() {
    return resolvePlatformAiConfigFromEnv({
      apiKey: this.configService.get<string>('PLATFORM_AI_API_KEY'),
      baseUrl: this.configService.get<string>('PLATFORM_AI_BASE_URL'),
      model: this.configService.get<string>('PLATFORM_AI_MODEL'),
    })
  }

  private async resolveConfig(): Promise<PlatformAiConfig> {
    const dbConfig = await this.platformSettingsService.getResolvedPlatformAiConfig()
    if (isPlatformAiProviderReady(dbConfig)) {
      return dbConfig
    }

    const envConfig = this.getEnvFallbackConfig()
    if (envConfig) {
      return envConfig
    }

    throw new ServiceUnavailableException(
      'Platform AI is not configured. Set credentials under Platform Settings → AI.',
    )
  }

  async testConnection(prompt = 'Reply with exactly: OK'): Promise<PlatformAiCompletionResult> {
    return this.chatCompletion([{ role: 'user', content: prompt }], {
      maxTokens: 32,
      temperature: 0,
    })
  }

  async chatCompletion(
    messages: PlatformAiMessage[],
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<PlatformAiCompletionResult> {
    const config = normalizePlatformAiConfig(await this.resolveConfig())
    const model = config.defaultModel!.trim()
    const maxTokens = options?.maxTokens ?? config.maxTokens ?? 512
    const temperature = options?.temperature ?? config.temperature ?? 0.6
    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')

    if (!config.apiKey?.trim() || !baseUrl) {
      throw new ServiceUnavailableException('Platform AI provider is not fully configured')
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey.trim()}`,
      'Content-Type': 'application/json',
      ...(config.extraHeaders || {}),
    }

    if (config.provider === AiProviderType.OPENROUTER) {
      if (config.siteUrl) {
        headers['HTTP-Referer'] = config.siteUrl
      }
      if (config.siteName) {
        headers['X-Title'] = config.siteName
      }
    }

    try {
      const { data } = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
        },
        { headers, timeout: 60_000 },
      )

      const content = data?.choices?.[0]?.message?.content?.trim()
      if (!content) {
        throw new ServiceUnavailableException('Platform AI returned an empty response')
      }

      return {
        content,
        model: data.model || model,
        totalTokens: data.usage?.total_tokens ?? 0,
      }
    } catch (error) {
      this.handleProviderError(error)
    }
  }

  private handleProviderError(error: unknown): never {
    if (error instanceof ServiceUnavailableException) {
      throw error
    }

    const message = mapAiProviderError(error)
    this.logger.error(`Platform AI request failed: ${message}`)
    throw new ServiceUnavailableException(message)
  }
}
