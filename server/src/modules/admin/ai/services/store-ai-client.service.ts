import {
  AiProviderType,
  StoreAiConfig,
} from '@/common/types/store-ai-config.types'
import { normalizeStoreAiConfig } from '@/modules/system/store/utils/store-ai.util'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import { Repository } from 'typeorm'
import { AiUsageLogService } from './ai-usage-log.service'
import { mapAiProviderError } from '../utils/map-ai-provider-error.util'

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StoreAiUsageContext {
  endpoint?: string
  jobId?: string
}

export interface AiChatCompletionOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  imageUrl?: string
  usageContext?: StoreAiUsageContext
}

export interface AiEmbeddingOptions {
  usageContext?: StoreAiUsageContext
}

export interface AiCompletionResult {
  content: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface AiEmbeddingResult {
  embeddings: number[][]
  model: string
  totalTokens: number
}

@Injectable()
export class StoreAiClientService {
  private readonly logger = new Logger(StoreAiClientService.name)

  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepo: Repository<StoreEntity>,
    private readonly usageLogService: AiUsageLogService,
  ) {}

  async getConfigForStore(storeId: string): Promise<StoreAiConfig> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } })
    if (!store) {
      throw new ServiceUnavailableException('Store not found')
    }
    return normalizeStoreAiConfig(store.aiConfig)
  }

  async chatCompletion(
    storeId: string,
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): Promise<AiCompletionResult> {
    const config = await this.getConfigForStore(storeId)
    this.assertConfigReady(config)

    const model = options?.model || config.defaultModel!
    const maxTokens = options?.maxTokens ?? config.maxTokens ?? 1024
    const temperature = options?.temperature ?? config.temperature ?? 0.7
    const payloadMessages = this.withOptionalVisionMessage(messages, options?.imageUrl)

    let result: AiCompletionResult
    switch (config.provider) {
      case AiProviderType.ANTHROPIC:
        result = await this.chatAnthropic(
          storeId,
          config,
          payloadMessages,
          model,
          maxTokens,
          temperature,
        )
        break
      case AiProviderType.GOOGLE:
        result = await this.chatGoogle(
          storeId,
          config,
          payloadMessages,
          model,
          maxTokens,
          temperature,
        )
        break
      case AiProviderType.AZURE_OPENAI:
        result = await this.chatAzureOpenAi(
          storeId,
          config,
          payloadMessages,
          model,
          maxTokens,
          temperature,
          options?.imageUrl,
        )
        break
      default:
        result = await this.chatOpenAiCompatible(
          storeId,
          config,
          payloadMessages,
          model,
          maxTokens,
          temperature,
          options?.imageUrl,
        )
    }

    void this.usageLogService.recordSafe({
      storeId,
      endpoint: options?.usageContext?.endpoint ?? 'chat',
      operation: 'chat',
      model: result.model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      jobId: options?.usageContext?.jobId,
    })

    return result
  }

  private withOptionalVisionMessage(
    messages: AiChatMessage[],
    imageUrl?: string,
  ): AiChatMessage[] {
    if (!imageUrl) return messages

    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIndex < 0) return messages

    const index = messages.length - 1 - lastUserIndex
    const target = messages[index]
    return messages.map((message, i) =>
      i === index
        ? {
            ...message,
            content: `${message.content}\n\n[Image URL for vision analysis: ${imageUrl}]`,
          }
        : message,
    )
  }

  private buildOpenAiMessages(
    messages: AiChatMessage[],
    imageUrl?: string,
  ): Array<{ role: string; content: string | Array<Record<string, unknown>> }> {
    if (!imageUrl) {
      return messages
    }

    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIndex < 0) {
      return messages
    }

    const index = messages.length - 1 - lastUserIndex
    return messages.map((message, i) => {
      if (i !== index || message.role !== 'user') {
        return message
      }

      return {
        role: message.role,
        content: [
          { type: 'text', text: message.content },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      }
    })
  }

  async testConnection(
    storeId: string,
    prompt = 'Reply with exactly: OK',
  ): Promise<AiCompletionResult> {
    return this.chatCompletion(storeId, [{ role: 'user', content: prompt }], {
      maxTokens: 32,
      temperature: 0,
      usageContext: { endpoint: 'ai-config/test' },
    })
  }

  async createEmbeddings(
    storeId: string,
    inputs: string[],
    options?: AiEmbeddingOptions,
  ): Promise<AiEmbeddingResult> {
    const config = await this.getConfigForStore(storeId)
    this.assertConfigReady(config)

    const model = config.embeddingModel?.trim()
    if (!model) {
      throw new ServiceUnavailableException('AI embedding model is not configured')
    }

    const normalizedInputs = inputs.map((input) => input.trim()).filter(Boolean)
    if (normalizedInputs.length === 0) {
      throw new ServiceUnavailableException('No text provided for embedding')
    }

    let result: AiEmbeddingResult
    switch (config.provider) {
      case AiProviderType.GOOGLE:
        result = await this.embedGoogle(storeId, config, normalizedInputs, model)
        break
      case AiProviderType.ANTHROPIC:
        throw new ServiceUnavailableException('Embeddings are not supported for Anthropic')
      case AiProviderType.AZURE_OPENAI:
        result = await this.embedAzureOpenAi(storeId, config, normalizedInputs, model)
        break
      default:
        result = await this.embedOpenAiCompatible(storeId, config, normalizedInputs, model)
    }

    void this.usageLogService.recordSafe({
      storeId,
      endpoint: options?.usageContext?.endpoint ?? 'embeddings',
      operation: 'embedding',
      model: result.model,
      totalTokens: result.totalTokens,
      jobId: options?.usageContext?.jobId,
    })

    return result
  }

  private assertConfigReady(config: StoreAiConfig): void {
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

  private handleProviderError(storeId: string, error: unknown): never {
    const message = mapAiProviderError(error)
    this.logger.error(`Store ${storeId} AI request failed: ${message}`)
    throw new ServiceUnavailableException(message)
  }

  private async chatOpenAiCompatible(
    storeId: string,
    config: StoreAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
    imageUrl?: string,
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
        {
          model,
          messages: this.buildOpenAiMessages(messages, imageUrl),
          max_tokens: maxTokens,
          temperature,
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
      this.handleProviderError(storeId, error)
    }
  }

  private async chatAnthropic(
    storeId: string,
    config: StoreAiConfig,
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
      this.handleProviderError(storeId, error)
    }
  }

  private async chatGoogle(
    storeId: string,
    config: StoreAiConfig,
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
      this.handleProviderError(storeId, error)
    }
  }

  private async chatAzureOpenAi(
    storeId: string,
    config: StoreAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
    imageUrl?: string,
  ): Promise<AiCompletionResult> {
    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      throw new ServiceUnavailableException('Azure deployment base URL is not configured')
    }

    const apiVersion = config.apiVersion || '2024-08-01-preview'

    try {
      const { data } = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: this.buildOpenAiMessages(messages, imageUrl),
          max_tokens: maxTokens,
          temperature,
        },
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
      this.handleProviderError(storeId, error)
    }
  }

  private async embedOpenAiCompatible(
    storeId: string,
    config: StoreAiConfig,
    inputs: string[],
    model: string,
  ): Promise<AiEmbeddingResult> {
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
        `${baseUrl}/embeddings`,
        {
          model,
          input: inputs,
        },
        { headers, timeout: 120_000 },
      )

      const embeddings = (data?.data || [])
        .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
        .map((item: { embedding: number[] }) => item.embedding)

      if (embeddings.length !== inputs.length) {
        throw new ServiceUnavailableException('AI provider returned incomplete embeddings')
      }

      return {
        embeddings,
        model: data.model || model,
        totalTokens: data.usage?.total_tokens ?? 0,
      }
    } catch (error) {
      this.handleProviderError(storeId, error)
    }
  }

  private async embedAzureOpenAi(
    storeId: string,
    config: StoreAiConfig,
    inputs: string[],
    model: string,
  ): Promise<AiEmbeddingResult> {
    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      throw new ServiceUnavailableException('Azure deployment base URL is not configured')
    }

    const apiVersion = config.apiVersion || '2024-08-01-preview'

    try {
      const { data } = await axios.post(
        `${baseUrl}/embeddings`,
        {
          model,
          input: inputs,
        },
        {
          params: { 'api-version': apiVersion },
          headers: {
            'api-key': config.apiKey!,
            'Content-Type': 'application/json',
            ...(config.extraHeaders || {}),
          },
          timeout: 120_000,
        },
      )

      const embeddings = (data?.data || [])
        .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
        .map((item: { embedding: number[] }) => item.embedding)

      if (embeddings.length !== inputs.length) {
        throw new ServiceUnavailableException('AI provider returned incomplete embeddings')
      }

      return {
        embeddings,
        model: data.model || model,
        totalTokens: data.usage?.total_tokens ?? 0,
      }
    } catch (error) {
      this.handleProviderError(storeId, error)
    }
  }

  private async embedGoogle(
    storeId: string,
    config: StoreAiConfig,
    inputs: string[],
    model: string,
  ): Promise<AiEmbeddingResult> {
    const baseUrl = (
      config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'
    ).replace(/\/$/, '')

    try {
      const embeddings: number[][] = []
      let totalTokens = 0

      for (const input of inputs) {
        const { data } = await axios.post(
          `${baseUrl}/models/${model}:embedContent`,
          {
            content: {
              parts: [{ text: input }],
            },
          },
          {
            params: { key: config.apiKey },
            headers: {
              'Content-Type': 'application/json',
              ...(config.extraHeaders || {}),
            },
            timeout: 120_000,
          },
        )

        const values = data?.embedding?.values
        if (!Array.isArray(values) || values.length === 0) {
          throw new ServiceUnavailableException('AI provider returned an empty embedding')
        }

        embeddings.push(values)
        totalTokens += data.usageMetadata?.totalTokenCount ?? 0
      }

      return {
        embeddings,
        model,
        totalTokens,
      }
    } catch (error) {
      this.handleProviderError(storeId, error)
    }
  }
}
