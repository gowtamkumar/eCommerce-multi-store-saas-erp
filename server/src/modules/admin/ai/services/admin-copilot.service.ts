import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { AdminCopilotDto } from '../dto/admin-copilot.dto'
import {
  ADMIN_COPILOT_TOOLS,
  AdminCopilotToolName,
  isAdminCopilotToolName,
} from '../copilot/admin-copilot-tool.registry'
import { AiChatMessage, StoreAiClientService } from './store-ai-client.service'
import { AdminCopilotToolService } from './admin-copilot-tool.service'

const ADMIN_COPILOT_SYSTEM_PROMPT = `You are a read-only admin copilot for an e-commerce ERP.
Answer using ONLY tool results and conversation context provided.
Never invent orders, stock counts, revenue, or customer data.
If data is missing, say what tool would be needed or what was not found.
Be concise. Use short paragraphs or bullets.
Never recommend mutating orders, inventory, prices, or finances — explain and point to admin screens only.`

interface ToolCallPlan {
  tool: AdminCopilotToolName
  args: Record<string, unknown>
}

@Injectable()
export class AdminCopilotService {
  constructor(
    private readonly aiClient: StoreAiClientService,
    private readonly toolService: AdminCopilotToolService,
  ) {}

  async ask(ctx: RequestContextDto, dto: AdminCopilotDto) {
    const toolCatalog = JSON.stringify(ADMIN_COPILOT_TOOLS)
    const planMessages: AiChatMessage[] = [
      {
        role: 'system',
        content: `You plan read-only tool calls for an admin copilot.
Available tools: ${toolCatalog}
Respond with JSON only (no markdown):
{"toolCalls":[{"tool":"listOrders","args":{"limit":5}}]}
Rules: max 3 tool calls; use exact tool names; empty array if no live data needed.`,
      },
      ...(dto.history ?? []).map((item) => ({
        role: item.role,
        content: item.content,
      })),
      { role: 'user', content: dto.message },
    ]

    const planResult = await this.aiClient.chatCompletion(ctx.storeId, planMessages, {
      temperature: 0.1,
      maxTokens: 400,
      usageContext: { endpoint: 'ai/copilot/admin/plan' },
    })

    const toolCalls = this.parseToolCalls(planResult.content).slice(0, 3)
    const toolsUsed: Array<{ tool: string; args: Record<string, unknown> }> = []
    const toolResults: Record<string, unknown> = {}

    for (const call of toolCalls) {
      toolsUsed.push({ tool: call.tool, args: call.args })
      const result = await this.toolService.execute(call.tool, call.args, ctx)
      toolResults[call.tool] = result
    }

    const answerMessages: AiChatMessage[] = [
      { role: 'system', content: ADMIN_COPILOT_SYSTEM_PROMPT },
      ...(dto.history ?? []).map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: 'user',
        content: [
          `User question: ${dto.message}`,
          toolCalls.length
            ? `Tool results JSON:\n${JSON.stringify(toolResults, null, 2)}`
            : 'No tools were called for this turn.',
        ].join('\n\n'),
      },
    ]

    const answerResult = await this.aiClient.chatCompletion(ctx.storeId, answerMessages, {
      temperature: 0.3,
      usageContext: { endpoint: 'ai/copilot/admin' },
    })

    return {
      reply: answerResult.content,
      model: answerResult.model,
      totalTokens: planResult.totalTokens + answerResult.totalTokens,
      toolsUsed,
    }
  }

  private parseToolCalls(content: string): ToolCallPlan[] {
    const trimmed = content.trim()
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return []
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        toolCalls?: Array<{ tool?: string; args?: Record<string, unknown> }>
      }
      const calls = parsed.toolCalls ?? []
      return calls
        .filter((call) => call.tool && isAdminCopilotToolName(call.tool))
        .map((call) => ({
          tool: call.tool as AdminCopilotToolName,
          args: call.args && typeof call.args === 'object' ? call.args : {},
        }))
    } catch {
      return []
    }
  }
}
