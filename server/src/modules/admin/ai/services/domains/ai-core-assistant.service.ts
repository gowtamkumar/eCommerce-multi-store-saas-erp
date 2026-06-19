import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { maskApiKey, normalizeTenantAiConfig } from '@/modules/system/tenant/utils/tenant-ai.util'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AiChatDto } from '../../dto/ai-chat.dto'
import { DashboardCopilotDto } from '../../dto/dashboard-copilot.dto'
import {
  buildDashboardCopilotMessages,
  buildDashboardKpiSnapshot,
} from '../../utils/dashboard-kpi-context.util'
import { AiAssistantBaseService } from '../ai-assistant-base.service'
import { AiChatMessage, TenantAiClientService } from '../tenant-ai-client.service'

const ASSISTANT_SYSTEM_PROMPT = `You are a helpful e-commerce and ERP assistant for store administrators.
Help with product ideas, marketing copy, operations questions, and business decisions.
Be concise, practical, and action-oriented. Never invent inventory, orders, or financial data.`

@Injectable()
export class AiCoreAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
    private readonly aiClient: TenantAiClientService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async getStatus(tenantId: string) {
    const config = await this.aiClient.getConfigForTenant(tenantId)
    const normalized = normalizeTenantAiConfig(config)
    const { hasApiKey } = maskApiKey(normalized.apiKey)

    return {
      enabled: normalized.enabled,
      configured: normalized.enabled && hasApiKey && !!normalized.defaultModel,
      provider: normalized.provider,
      defaultModel: normalized.defaultModel,
      hasApiKey,
    }
  }

  async chat(tenantId: string, dto: AiChatDto) {
    const messages: AiChatMessage[] = [{ role: 'system', content: ASSISTANT_SYSTEM_PROMPT }]

    for (const item of dto.history || []) {
      messages.push({ role: item.role, content: item.content })
    }

    messages.push({ role: 'user', content: dto.message })

    const result = await this.base.complete(tenantId, messages, 'ai/chat')
    return {
      reply: result.content,
      model: result.model,
      totalTokens: result.totalTokens,
    }
  }

  async askDashboardCopilot(ctx: RequestContextDto, dto: DashboardCopilotDto) {
    const reportService = this.moduleRef.get(ReportService, { strict: false })
    if (!reportService) {
      throw new BadRequestException('Dashboard reports are not available')
    }

    const period = dto.period || 'month'
    const stats = await reportService.getDashboardReport(ctx, period)
    const snapshot = buildDashboardKpiSnapshot(stats, period)
    const messages = buildDashboardCopilotMessages(snapshot, dto.message, dto.history || [])

    const result = await this.base.complete(
      ctx.tenantId,
      messages as AiChatMessage[],
      'ai/copilot/dashboard',
      {
        temperature: 0.3,
      },
    )

    return {
      reply: result.content,
      model: result.model,
      totalTokens: result.totalTokens,
    }
  }
}
