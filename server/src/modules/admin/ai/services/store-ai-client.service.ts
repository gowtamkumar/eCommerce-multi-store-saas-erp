import { AiProviderType, StoreAiConfig, StoreAiFallbackConfig } from '@/common/types/store-ai-config.types'
import { normalizeStoreAiConfig } from '@/modules/system/store/utils/store-ai.util'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import axios, { AxiosError } from 'axios'
import { Readable } from 'stream'
import * as readline from 'readline'
import { AiUsageLogService } from './ai-usage-log.service'
import { AiRateLimiterService } from './ai-rate-limiter.service'
import { mapAiProviderError } from '../utils/map-ai-provider-error.util'
import { StoreRepository } from '@/modules/system/store/store.repository'

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

export type AiStreamChunk =
  | { type: 'token'; content: string }
  | {
      type: 'done'
      model: string
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  | { type: 'error'; message: string }
  | {
      type: 'fallback'
      message: string
      fromProvider: string
      toProvider: string
    }

@Injectable()
export class StoreAiClientService {
  private readonly logger = new Logger(StoreAiClientService.name)

  constructor(
    private readonly storeRepo: StoreRepository,
    private readonly usageLogService: AiUsageLogService,
    private readonly rateLimiter: AiRateLimiterService,
  ) {}

  async getConfigForStore(storeId: string): Promise<StoreAiConfig> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } })
    if (!store) {
      throw new ServiceUnavailableException('Store not found')
    }
    return normalizeStoreAiConfig(store.aiConfig)
  }

  private isRateLimitError(error: unknown): boolean {
    const axiosError = error as AxiosError
    return axiosError?.response?.status === 429
  }

  private async withRateLimitAndRetry<T>(
    provider: string,
    estimatedTokens: number,
    fn: () => Promise<T>,
    recordTokens: (result: T) => number,
  ): Promise<T> {
    const maxRetries = 3

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const check = this.rateLimiter.check(provider, estimatedTokens)
      if (!check.allowed && check.retryAfterMs) {
        if (attempt >= maxRetries) {
          throw new ServiceUnavailableException(
            `AI provider rate limit reached for ${provider}. Try again later.`,
          )
        }
        await this.sleep(check.retryAfterMs)
        continue
      }

      try {
        const result = await fn()
        const tokens = recordTokens(result)
        this.rateLimiter.record(provider, tokens)
        return result
      } catch (error) {
        if (this.isRateLimitError(error) && attempt < maxRetries) {
          this.rateLimiter.recordError(provider)
          const backoff = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10_000)
          this.logger.warn(
            `429 rate limit on ${provider}, retry ${attempt + 1}/${maxRetries} after ${backoff}ms`,
          )
          await this.sleep(backoff)
          continue
        }
        throw error
      }
    }

    throw new ServiceUnavailableException(`AI provider rate limit reached for ${provider}.`)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private shouldFallback(error: unknown): boolean {
    return !this.isRateLimitError(error)
  }

  private mergeFallbackConfig(config: StoreAiConfig, fallback: StoreAiFallbackConfig): StoreAiConfig {
    return {
      ...config,
      provider: fallback.provider,
      apiKey: fallback.apiKey ?? config.apiKey,
      baseUrl: fallback.baseUrl ?? config.baseUrl,
      defaultModel: fallback.defaultModel ?? config.defaultModel,
      embeddingModel: fallback.embeddingModel ?? config.embeddingModel,
      apiVersion: fallback.apiVersion ?? config.apiVersion,
      siteUrl: fallback.siteUrl ?? config.siteUrl,
      siteName: fallback.siteName ?? config.siteName,
      extraHeaders: fallback.extraHeaders ?? config.extraHeaders,
    }
  }

  private async withFallback<T>(
    config: StoreAiConfig,
    storeId: string,
    fn: (effectiveConfig: StoreAiConfig) => Promise<T>,
  ): Promise<T> {
    try {
      return await fn(config)
    } catch (error) {
      if (config.fallback && this.shouldFallback(error)) {
        const fallbackConfig = this.mergeFallbackConfig(config, config.fallback)
        this.logger.warn(
          `Store ${storeId}: Primary AI provider "${config.provider}" failed, ` +
          `falling back to "${fallbackConfig.provider}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
        return await fn(fallbackConfig)
      }
      throw error
    }
  }

  private async *withStreamFallback(
    config: StoreAiConfig,
    storeId: string,
    streamFn: (effectiveConfig: StoreAiConfig) => AsyncGenerator<AiStreamChunk>,
  ): AsyncGenerator<AiStreamChunk> {
    let usedFallback = false
    const generator = streamFn(config)
    for await (const chunk of generator) {
      if (chunk.type === 'error' && config.fallback && !usedFallback) {
        usedFallback = true
        const fallbackConfig = this.mergeFallbackConfig(config, config.fallback)
        this.logger.warn(
          `Store ${storeId}: Primary AI provider "${config.provider}" failed streaming, ` +
          `falling back to "${fallbackConfig.provider}": ${chunk.message}`,
        )
        yield {
          type: 'fallback',
          message: `Primary AI provider "${config.provider}" failed, falling back to "${fallbackConfig.provider}"`,
          fromProvider: config.provider as string,
          toProvider: fallbackConfig.provider as string,
        }
        const fallbackGen = streamFn(fallbackConfig)
        for await (const fbChunk of fallbackGen) {
          yield fbChunk
        }
        return
      }
      yield chunk
    }
  }

  async chatCompletion(
    storeId: string,
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): Promise<AiCompletionResult> {
    const config = await this.getConfigForStore(storeId)
    this.assertConfigReady(config)

    return this.withFallback(config, storeId, (effectiveConfig) =>
      this.executeChatCompletion(effectiveConfig, storeId, messages, options),
    )
  }

  private async executeChatCompletion(
    config: StoreAiConfig,
    storeId: string,
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): Promise<AiCompletionResult> {
    const model = options?.model || config.defaultModel!
    const maxTokens = options?.maxTokens ?? config.maxTokens ?? 1024
    const temperature = options?.temperature ?? config.temperature ?? 0.7
    const payloadMessages = this.withOptionalVisionMessage(messages, options?.imageUrl)

    const provider = config.provider as string
    const estimatedTokens =
      this.estimateTokens(messages.map((m) => m.content).join(' ')) + maxTokens

    const result = await this.withRateLimitAndRetry(
      provider,
      estimatedTokens,
      async () => {
        switch (config.provider) {
          case AiProviderType.ANTHROPIC:
            return this.chatAnthropic(storeId, config, payloadMessages, model, maxTokens, temperature)
          case AiProviderType.GOOGLE:
            return this.chatGoogle(storeId, config, payloadMessages, model, maxTokens, temperature)
          default:
            return this.chatOpenAiCompatible(storeId, config, payloadMessages, model, maxTokens, temperature, options?.imageUrl)
        }
      },
      (res: AiCompletionResult) => res.totalTokens || estimatedTokens,
    )

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

  async *streamChatCompletion(
    storeId: string,
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): AsyncGenerator<AiStreamChunk> {
    const config = await this.getConfigForStore(storeId)
    this.assertConfigReady(config)

    yield* this.withStreamFallback(config, storeId, (effectiveConfig) =>
      this.executeStreamChatCompletion(effectiveConfig, storeId, messages, options),
    )
  }

  private async *executeStreamChatCompletion(
    config: StoreAiConfig,
    storeId: string,
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): AsyncGenerator<AiStreamChunk> {
    const model = options?.model || config.defaultModel!
    const maxTokens = options?.maxTokens ?? config.maxTokens ?? 1024
    const temperature = options?.temperature ?? config.temperature ?? 0.7
    const payloadMessages = this.withOptionalVisionMessage(messages, options?.imageUrl)

    const provider = config.provider as string
    const estimatedTokens =
      this.estimateTokens(messages.map((m) => m.content).join(' ')) + maxTokens

    const check = this.rateLimiter.check(provider, estimatedTokens)
    if (!check.allowed) {
      yield {
        type: 'error',
        message: `AI provider rate limit reached for ${provider}. Please wait before sending another message.`,
      }
      return
    }

    this.rateLimiter.record(provider, estimatedTokens)

    let endpoint = options?.usageContext?.endpoint ?? 'chat/stream'
    let operation: 'chat' | 'embedding' = 'chat'
    let finalModel = model
    let promptTokens = 0
    let completionTokens = 0

    try {
      switch (config.provider) {
        case AiProviderType.ANTHROPIC: {
          const gen = this.streamChatAnthropic(storeId, config, payloadMessages, model, maxTokens, temperature)
          for await (const chunk of gen) {
            if (chunk.type === 'done') {
              finalModel = chunk.model
              promptTokens = chunk.promptTokens
              completionTokens = chunk.completionTokens
            }
            yield chunk
          }
          break
        }
        case AiProviderType.GOOGLE: {
          const gen = this.streamChatGoogle(storeId, config, payloadMessages, model, maxTokens, temperature)
          for await (const chunk of gen) {
            if (chunk.type === 'done') {
              finalModel = chunk.model
              promptTokens = chunk.promptTokens
              completionTokens = chunk.completionTokens
            }
            yield chunk
          }
          break
        }
        default: {
          const gen = this.streamChatOpenAiCompatible(storeId, config, payloadMessages, model, maxTokens, temperature, options?.imageUrl)
          for await (const chunk of gen) {
            if (chunk.type === 'done') {
              finalModel = chunk.model
              promptTokens = chunk.promptTokens
              completionTokens = chunk.completionTokens
            }
            yield chunk
          }
        }
      }
    } catch (error) {
      yield { type: 'error', message: mapAiProviderError(error) }
      return
    }

    void this.usageLogService.recordSafe({
      storeId,
      endpoint,
      operation,
      model: finalModel,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      jobId: options?.usageContext?.jobId,
    })
  }

  private async *streamChatOpenAiCompatible(
    storeId: string,
    config: StoreAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
    imageUrl?: string,
  ): AsyncGenerator<AiStreamChunk> {
    const baseUrl = (config.baseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      yield { type: 'error', message: 'AI base URL is not configured' }
      return
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.extraHeaders || {}),
    }

    if (config.provider === AiProviderType.OPENROUTER) {
      if (config.siteUrl) headers['HTTP-Referer'] = config.siteUrl
      if (config.siteName) headers['X-Title'] = config.siteName
    }

    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: this.buildOpenAiMessages(messages, imageUrl),
          max_tokens: maxTokens,
          temperature,
          stream: true,
          stream_options: { include_usage: true },
        },
        { headers, responseType: 'stream', timeout: 120_000 },
      )

      const stream: Readable = response.data
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })
      let completionTokens = 0

      try {
        for await (const line of rl) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload || payload === '[DONE]') continue

          try {
            const parsed = JSON.parse(payload)
            const choice = parsed.choices?.[0]
            if (choice?.delta?.content) {
              const text: string = choice.delta.content
              completionTokens += this.estimateTokens(text)
              yield { type: 'token', content: text }
            }
            if (parsed.usage) {
              yield {
                type: 'done',
                model: parsed.model || model,
                promptTokens: parsed.usage.prompt_tokens ?? 0,
                completionTokens: parsed.usage.completion_tokens ?? 0,
                totalTokens: parsed.usage.total_tokens ?? 0,
              }
              return
            }
          } catch {
            // skip malformed JSON in stream
          }
        }
      } finally {
        rl.close()
      }

      yield {
        type: 'done',
        model,
        promptTokens: 0,
        completionTokens,
        totalTokens: completionTokens,
      }
    } catch (error) {
      throw error
    }
  }

  private async *streamChatAnthropic(
    storeId: string,
    config: StoreAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): AsyncGenerator<AiStreamChunk> {
    const baseUrl = (config.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')
    const systemMessage = messages.find((m) => m.role === 'system')?.content
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const response = await axios.post(
        `${baseUrl}/messages`,
        {
          model,
          max_tokens: maxTokens,
          temperature,
          ...(systemMessage ? { system: systemMessage } : {}),
          messages: chatMessages,
          stream: true,
        },
        {
          responseType: 'stream',
          timeout: 120_000,
          headers: {
            'x-api-key': config.apiKey!,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
            ...(config.extraHeaders || {}),
          },
        },
      )

      const stream: Readable = response.data
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })
      let completionTokens = 0
      let finalModel = model
      let inputTokens = 0

      try {
        for await (const line of rl) {
          if (line.startsWith('event: ')) {
            continue
          }
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload) continue

          try {
            const parsed = JSON.parse(payload)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              const text: string = parsed.delta.text
              completionTokens += this.estimateTokens(text)
              yield { type: 'token', content: text }
            } else if (parsed.type === 'message_delta') {
              if (parsed.usage) {
                inputTokens = parsed.usage.input_tokens ?? 0
                completionTokens = parsed.usage.output_tokens ?? 0
              }
            } else if (parsed.type === 'message_start') {
              if (parsed.message?.model) finalModel = parsed.message.model
              if (parsed.message?.usage) {
                inputTokens = parsed.message.usage.input_tokens ?? 0
              }
            } else if (parsed.type === 'message_stop') {
              yield {
                type: 'done',
                model: finalModel,
                promptTokens: inputTokens,
                completionTokens,
                totalTokens: inputTokens + completionTokens,
              }
              return
            }
          } catch {
            // skip malformed JSON
          }
        }
      } finally {
        rl.close()
      }

      yield {
        type: 'done',
        model: finalModel,
        promptTokens: inputTokens,
        completionTokens,
        totalTokens: inputTokens + completionTokens,
      }
    } catch (error) {
      throw error
    }
  }

  private async *streamChatGoogle(
    storeId: string,
    config: StoreAiConfig,
    messages: AiChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): AsyncGenerator<AiStreamChunk> {
    const baseUrl = (config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(
      /\/$/,
      '',
    )

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const systemInstruction = messages.find((m) => m.role === 'system')?.content

    try {
      const response = await axios.post(
        `${baseUrl}/models/${model}:streamGenerateContent`,
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
          responseType: 'stream',
          timeout: 120_000,
        },
      )

      const stream: Readable = response.data
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })
      let completionTokens = 0
      let inputTokens = 0

      try {
        for await (const line of rl) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload || payload === '[DONE]') continue

          try {
            const parsed = JSON.parse(payload)
            const candidate = parsed.candidates?.[0]
            const text = candidate?.content?.parts?.[0]?.text
            if (text) {
              completionTokens += this.estimateTokens(text)
              yield { type: 'token', content: text }
            }
            if (parsed.usageMetadata) {
              inputTokens = parsed.usageMetadata.promptTokenCount ?? 0
              completionTokens = parsed.usageMetadata.candidatesTokenCount ?? 0
            }
          } catch {
            // skip malformed JSON
          }
        }
      } finally {
        rl.close()
      }

      yield {
        type: 'done',
        model,
        promptTokens: inputTokens,
        completionTokens,
        totalTokens: inputTokens + completionTokens,
      }
    } catch (error) {
      throw error
    }
  }

  private estimateTokens(text: string): number {
    if (!text) return 0
    return Math.ceil(text.length / 4)
  }

  private withOptionalVisionMessage(messages: AiChatMessage[], imageUrl?: string): AiChatMessage[] {
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

    return this.withFallback(config, storeId, (effectiveConfig) =>
      this.executeEmbeddings(effectiveConfig, storeId, inputs, options),
    )
  }

  private async executeEmbeddings(
    config: StoreAiConfig,
    storeId: string,
    inputs: string[],
    options?: AiEmbeddingOptions,
  ): Promise<AiEmbeddingResult> {
    const model = config.embeddingModel?.trim()
    if (!model) {
      throw new ServiceUnavailableException('AI embedding model is not configured')
    }

    const normalizedInputs = inputs.map((input) => input.trim()).filter(Boolean)
    if (normalizedInputs.length === 0) {
      throw new ServiceUnavailableException('No text provided for embedding')
    }

    const provider = config.provider as string
    const estimatedTokens = normalizedInputs.reduce((sum, t) => sum + this.estimateTokens(t), 0)

    const result = await this.withRateLimitAndRetry(
      provider,
      estimatedTokens,
      async () => {
        switch (config.provider) {
          case AiProviderType.GOOGLE:
            return this.embedGoogle(storeId, config, normalizedInputs, model)
          case AiProviderType.ANTHROPIC:
            throw new ServiceUnavailableException('Embeddings are not supported for Anthropic')
          default:
            return this.embedOpenAiCompatible(storeId, config, normalizedInputs, model)
        }
      },
      (res: AiEmbeddingResult) => res.totalTokens || estimatedTokens,
    )

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
    if (this.isRateLimitError(error)) {
      throw error
    }
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
    const baseUrl = (config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(
      /\/$/,
      '',
    )

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

  private async embedGoogle(
    storeId: string,
    config: StoreAiConfig,
    inputs: string[],
    model: string,
  ): Promise<AiEmbeddingResult> {
    const baseUrl = (config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(
      /\/$/,
      '',
    )

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
