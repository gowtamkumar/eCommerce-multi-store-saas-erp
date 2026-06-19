import { Injectable } from '@nestjs/common'
import {
  GenerateSupportConversationSummaryDto,
  SupportConversationSummaryResultDto,
} from '../../dto/generate-support-conversation-summary.dto'
import {
  GenerateSupportMessageIntentsDto,
  SupportMessageIntentsResultDto,
} from '../../dto/generate-support-message-intents.dto'
import { GenerateSupportReplyDto, SupportReplyResultDto } from '../../dto/generate-support-reply.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiSupportAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

  async generateSupportReply(
    tenantId: string,
    dto: GenerateSupportReplyDto,
  ): Promise<SupportReplyResultDto> {
    const prompt = `Draft a live-chat reply for a support agent as JSON only (no markdown fences).
Customer: ${dto.customerName}
${dto.customerEmail ? `Customer email: ${dto.customerEmail}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: friendly, helpful, and concise — suitable for live chat'}

Recent conversation:
${dto.conversationSummary}

${dto.faqSummary ? `Relevant store FAQs (use for policy answers; do not contradict):\n${dto.faqSummary}` : 'No FAQ context provided.'}

${dto.orderSummary ? `Customer order lookup:\n${dto.orderSummary}` : 'No order context provided.'}

Return exactly this JSON shape:
{
  "suggestedReply": "string (1-3 short paragraphs or bullet points, plain text, ready to send in chat — address the visitor's latest message; cite order status or FAQ only when supported by context; do not invent tracking numbers, refunds, or policies)"
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You draft live support chat replies for e-commerce stores. Respond with valid JSON only, no extra text. Never promise refunds, shipping dates, or order changes not stated in the context. Keep replies conversational and brief.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/support-reply',
      { temperature: 0.55 },
    )

    return this.base.parseJsonResponse<SupportReplyResultDto>(result.content, {
      suggestedReply: result.content,
    })
  }

  async generateSupportConversationSummary(
    tenantId: string,
    dto: GenerateSupportConversationSummaryDto,
  ): Promise<SupportConversationSummaryResultDto> {
    const prompt = `Summarize this live support chat for an internal agent handoff as JSON only (no markdown fences).
Customer: ${dto.customerName}
${dto.customerEmail ? `Customer email: ${dto.customerEmail}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: factual, concise, and neutral — internal notes only'}

Conversation transcript:
${dto.conversationSummary}

${dto.faqSummary ? `Relevant store FAQs (for policy context only):\n${dto.faqSummary}` : 'No FAQ context provided.'}

${dto.orderSummary ? `Customer order lookup:\n${dto.orderSummary}` : 'No order context provided.'}

Return exactly this JSON shape:
{
  "handoffSummary": "string (3-5 sentences for the next agent — what happened, current status, and what the visitor expects; facts only from transcript and order/FAQ context)",
  "keyPoints": ["string (3-6 short bullet facts — order refs, policies cited, commitments made by either party; max 120 chars each)"],
  "suggestedNextSteps": ["string (2-5 concrete actions for the next agent — e.g. verify tracking, offer replacement; do not invent refunds or policies)"],
  "pendingVisitorRequests": ["string (0-4 open questions or requests the visitor still expects an answer to; empty array if resolved)"]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write internal support handoff notes for e-commerce live chat. Respond with valid JSON only, no extra text. Never invent order numbers, refunds, shipping dates, or policies not supported by the context. Do not address the customer — write for the next agent.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/support-conversation-summary',
      { temperature: 0.4 },
    )

    return this.base.parseJsonResponse<SupportConversationSummaryResultDto>(result.content, {
      handoffSummary: result.content.trim(),
      keyPoints: [],
      suggestedNextSteps: [],
      pendingVisitorRequests: [],
    })
  }

  async generateSupportMessageIntents(
    tenantId: string,
    dto: GenerateSupportMessageIntentsDto,
  ): Promise<SupportMessageIntentsResultDto> {
    if (!dto.messages.length) {
      return { messageIntents: [] }
    }

    const serialized = dto.messages
      .map((m, index) => `${index + 1}. [id=${m.messageId}] ${m.text}`)
      .join('\n')

    const prompt = `Label visitor live-chat messages with short intent tags for support agents. JSON only (no markdown fences).

${dto.conversationSummary ? `Conversation context:\n${dto.conversationSummary}\n\n` : ''}Visitor messages (label each by message id):
${serialized}

Rules:
- Use 0-3 intent tags per message (empty array if unclear or greeting only)
- Tags are lowercase snake_case or single words, max 24 chars each (e.g. order_status, shipping, return_refund, billing, product_question, pricing, account, complaint, technical, warranty, general)
- Base tags only on that message's text and optional context — do not invent order facts

Return exactly this JSON shape:
{
  "messageIntents": [
    { "messageId": "uuid from input", "intentTags": ["tag1", "tag2"] }
  ]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You classify e-commerce support chat intents for agents. Respond with valid JSON only. Include one entry per input message id.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/support-message-intents',
      { temperature: 0.2 },
    )

    const parsed = this.base.parseJsonResponse<SupportMessageIntentsResultDto>(result.content, {
      messageIntents: [],
    })

    const allowedIds = new Set(dto.messages.map((m) => m.messageId))
    return {
      messageIntents: (parsed.messageIntents || [])
        .filter((row) => allowedIds.has(row.messageId))
        .map((row) => ({
          messageId: row.messageId,
          intentTags: (row.intentTags || [])
            .map((tag) => String(tag).trim().toLowerCase().replace(/\s+/g, '_'))
            .filter(Boolean)
            .slice(0, 3),
        })),
    }
  }
}
