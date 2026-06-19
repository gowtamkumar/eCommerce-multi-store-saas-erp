import { Injectable } from '@nestjs/common'
import {
  AiChatMessage,
  AiCompletionResult,
  TenantAiClientService,
} from './tenant-ai-client.service'

@Injectable()
export class AiAssistantBaseService {
  constructor(private readonly aiClient: TenantAiClientService) {}

  complete(
    tenantId: string,
    messages: AiChatMessage[],
    endpoint: string,
    options?: Parameters<TenantAiClientService['chatCompletion']>[2],
  ): Promise<AiCompletionResult> {
    return this.aiClient.chatCompletion(tenantId, messages, {
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
