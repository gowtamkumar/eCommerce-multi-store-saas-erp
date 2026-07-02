import { Injectable } from '@nestjs/common'
import {
  AiChatMessage,
  AiCompletionResult,
  StoreAiClientService,
} from './store-ai-client.service'

@Injectable()
export class AiAssistantBaseService {
  constructor(private readonly aiClient: StoreAiClientService) {}

  complete(
    storeId: string,
    messages: AiChatMessage[],
    endpoint: string,
    options?: Parameters<StoreAiClientService['chatCompletion']>[2],
  ): Promise<AiCompletionResult> {
    return this.aiClient.chatCompletion(storeId, messages, {
      ...options,
      usageContext: { endpoint, jobId: options?.usageContext?.jobId },
    })
  }

  parseJsonResponse<T>(content: string, fallback: T): T {
    const trimmed = content.trim()
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return fallback
    }

    try {
      return { ...fallback, ...JSON.parse(jsonMatch[0]) } as T
    } catch {
      return fallback
    }
  }
}
