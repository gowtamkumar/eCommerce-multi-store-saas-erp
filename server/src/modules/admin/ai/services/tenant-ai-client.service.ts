import { TenantAiConfig } from '@/common/types/tenant-ai-config.types'
import { normalizeTenantAiConfig } from '@/modules/system/tenant/utils/tenant-ai.util'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import axios, { AxiosError } from 'axios'
import { Repository } from 'typeorm'

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiCompletionResult {
  content: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

@Injectable()
export class TenantAiClientService {
  private readonly logger = new Logger(TenantAiClientService.name)

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  async getConfigForTenant(tenantId: string): Promise<TenantAiConfig> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant) {
      throw new ServiceUnavailableException('Tenant not found')
    }
    return normalizeTenantAiConfig(tenant.aiConfig)
  }

  async chatCompletion(
    tenantId: string,
    messages: AiChatMessage[],
    options?: { model?: string; maxTokens?: number; temperature?: number },
  ): Promise<AiCompletionResult> {
    const config = await this.getConfigForTenant(tenantId)

    if (!config.enabled) {
      throw new ServiceUnavailableException('AI is not enabled for this store')
    }

    if (!config.apiKey?.trim()) {
      throw new ServiceUnavailableException('AI API key is not configured for this store')
    }

    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      throw new ServiceUnavailableException('AI base URL is not configured')
    }

    const model = options?.model || config.defaultModel
    if (!model) {
      throw new ServiceUnavailableException('AI default model is not configured')
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.extraHeaders || {}),
    }

    if (config.siteUrl) {
      headers['HTTP-Referer'] = config.siteUrl
    }
    if (config.siteName) {
      headers['X-Title'] = config.siteName
    }

    try {
      const { data } = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages,
          max_tokens: options?.maxTokens ?? config.maxTokens ?? 1024,
          temperature: options?.temperature ?? config.temperature ?? 0.7,
        },
        { headers, timeout: 60_000 },
      )

      const content = data?.choices?.[0]?.message?.content?.trim()
      if (!content) {
        throw new ServiceUnavailableException('AI provider returned an empty response')
      }

      return {
        content,
        model: data.model || model,
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>
      const message =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'AI provider request failed'
      this.logger.error(`Tenant ${tenantId} AI request failed: ${message}`)
      throw new ServiceUnavailableException(`AI provider error: ${message}`)
    }
  }

  async testConnection(
    tenantId: string,
    prompt = 'Reply with exactly: OK',
  ): Promise<AiCompletionResult> {
    return this.chatCompletion(tenantId, [{ role: 'user', content: prompt }], {
      maxTokens: 32,
      temperature: 0,
    })
  }
}
