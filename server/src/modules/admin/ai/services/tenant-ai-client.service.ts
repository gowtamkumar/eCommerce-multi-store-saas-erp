import {
  AiProviderType,
  TenantAiConfig,
} from '@/common/types/tenant-ai-config.types'
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
    this.assertConfigReady(config)

    const model = options?.model || config.defaultModel!
    const maxTokens = options?.maxTokens ?? config.maxTokens ?? 1024
    const temperature = options?.temperature ?? config.temperature ?? 0.7

    switch (config.provider) {
      case AiProviderType.ANTHROPIC:
        return this.chatAnthropic(config, messages, model, maxTokens, temperature)
      case AiProviderType.GOOGLE:
        return this.chatGoogle(config, messages, model, maxTokens, temperature)
      case AiProviderType.AZURE_OPENAI:
        return this.chatAzureOpenAi(config, messages, model, maxTokens, temperature)
      default:
        return this.chatOpenAiCompatible(config, messages, model, maxTokens, temperature)
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

  private assertConfigReady(config: TenantAiConfig): void {
    if (!config.enabled) {
      throw new ServiceUnavailableException('AI is not enabled for this store')
    }
    if (!config.apiKey?.trim()) {
      throw new ServiceUnavailableException('AI API key is not configured for this store')
    }
    if (!config.defaultModel?.trim()) {
      throw new ServiceUnavailableException('AI default model is not configured')
    }
  }

  private handleProviderError(tenantId: string, error: unknown): never {
    const axiosError = error as AxiosError<{
      error?: { message?: string }
      message?: string
    }>
    const message =
      axiosError.response?.data?.error?.message ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      'AI provider request failed'
    this.logger.error(`Tenant ${tenantId} AI request failed: ${message}`)
    throw new ServiceUnavailableException(`AI provider error: ${message}`)
  }

  private async chatOpenAiCompatible(
    config: TenantAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): Promise<AiCompletionResult> {
    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      throw new ServiceUnavailableException('AI base URL is not configured')
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
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
        { model, messages, max_tokens: maxTokens, temperature },
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
      this.handleProviderError('unknown', error)
    }
  }

  private async chatAnthropic(
    config: TenantAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): Promise<AiCompletionResult> {
    const baseUrl = (config.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')
    const systemMessage = messages.find((m) => m.role === 'system')?.content
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const { data } = await axios.post(
        `${baseUrl}/messages`,
        {
          model,
          max_tokens: maxTokens,
          temperature,
          ...(systemMessage ? { system: systemMessage } : {}),
          messages: chatMessages,
        },
        {
          headers: {
            'x-api-key': config.apiKey!,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
            ...(config.extraHeaders || {}),
          },
          timeout: 60_000,
        },
      )

      const content = data?.content?.[0]?.text?.trim()
      if (!content) {
        throw new ServiceUnavailableException('AI provider returned an empty response')
      }

      return {
        content,
        model: data.model || model,
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
        totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      }
    } catch (error) {
      this.handleProviderError('unknown', error)
    }
  }

  private async chatGoogle(
    config: TenantAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): Promise<AiCompletionResult> {
    const baseUrl = (
      config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'
    ).replace(/\/$/, '')

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const systemInstruction = messages.find((m) => m.role === 'system')?.content

    try {
      const { data } = await axios.post(
        `${baseUrl}/models/${model}:generateContent`,
        {
          ...(systemInstruction
            ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
            : {}),
          contents,
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
          },
        },
        {
          params: { key: config.apiKey },
          headers: {
            'Content-Type': 'application/json',
            ...(config.extraHeaders || {}),
          },
          timeout: 60_000,
        },
      )

      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (!content) {
        throw new ServiceUnavailableException('AI provider returned an empty response')
      }

      const usage = data.usageMetadata || {}
      return {
        content,
        model,
        promptTokens: usage.promptTokenCount ?? 0,
        completionTokens: usage.candidatesTokenCount ?? 0,
        totalTokens: usage.totalTokenCount ?? 0,
      }
    } catch (error) {
      this.handleProviderError('unknown', error)
    }
  }

  private async chatAzureOpenAi(
    config: TenantAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): Promise<AiCompletionResult> {
    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      throw new ServiceUnavailableException('Azure deployment base URL is not configured')
    }

    const apiVersion = config.apiVersion || '2024-08-01-preview'

    try {
      const { data } = await axios.post(
        `${baseUrl}/chat/completions`,
        { model, messages, max_tokens: maxTokens, temperature },
        {
          params: { 'api-version': apiVersion },
          headers: {
            'api-key': config.apiKey!,
            'Content-Type': 'application/json',
            ...(config.extraHeaders || {}),
          },
          timeout: 60_000,
        },
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
      this.handleProviderError('unknown', error)
    }
  }
}
