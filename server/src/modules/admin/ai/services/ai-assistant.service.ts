import { maskApiKey, normalizeTenantAiConfig } from '@/modules/system/tenant/utils/tenant-ai.util'
import { Injectable } from '@nestjs/common'
import { AiChatDto } from '../dto/ai-chat.dto'
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../dto/generate-campaign-copy.dto'
import {
  GenerateProductContentDto,
  ProductContentResultDto,
} from '../dto/generate-product-content.dto'
import { AiChatMessage, TenantAiClientService } from './tenant-ai-client.service'

const ASSISTANT_SYSTEM_PROMPT = `You are a helpful e-commerce and ERP assistant for store administrators.
Help with product ideas, marketing copy, operations questions, and business decisions.
Be concise, practical, and action-oriented. Never invent inventory, orders, or financial data.`

@Injectable()
export class AiAssistantService {
  constructor(private readonly aiClient: TenantAiClientService) {}

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

    const result = await this.aiClient.chatCompletion(tenantId, messages)
    return {
      reply: result.content,
      model: result.model,
      totalTokens: result.totalTokens,
    }
  }

  async generateProductContent(
    tenantId: string,
    dto: GenerateProductContentDto,
  ): Promise<ProductContentResultDto> {
    const prompt = `Generate product listing content as JSON only (no markdown fences).
Product name: ${dto.productName}
${dto.category ? `Category: ${dto.category}` : ''}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.existingDescription ? `Existing description to improve: ${dto.existingDescription}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional'}

Return exactly this JSON shape:
{
  "title": "string",
  "shortDescription": "string (max 160 chars)",
  "description": "string (2-4 paragraphs, HTML allowed with p/ul/li tags only)",
  "seoTitle": "string (max 60 chars)",
  "seoDescription": "string (max 155 chars)",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert e-commerce copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.6 },
    )

    return this.parseJsonResponse<ProductContentResultDto>(result.content, {
      title: dto.productName,
      shortDescription: '',
      description: result.content,
      seoTitle: dto.productName,
      seoDescription: '',
      tags: [],
    })
  }

  async generateCampaignCopy(
    tenantId: string,
    dto: GenerateCampaignCopyDto,
  ): Promise<CampaignCopyResultDto> {
    const channel = dto.channel || 'both'
    const prompt = `Generate marketing campaign copy as JSON only (no markdown fences).
Campaign: ${dto.campaignName}
${dto.audience ? `Audience: ${dto.audience}` : ''}
${dto.offerDetails ? `Offer: ${dto.offerDetails}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: friendly and persuasive'}
Channel: ${channel}

Return exactly this JSON shape:
{
  ${channel === 'email' || channel === 'both' ? '"emailSubject": "string",\n  "emailBody": "string (HTML with p/br only)",' : ''}
  ${channel === 'sms' || channel === 'both' ? '"smsText": "string (max 160 chars)"' : ''}
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert email and SMS marketer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.7 },
    )

    return this.parseJsonResponse<CampaignCopyResultDto>(result.content, {})
  }

  private parseJsonResponse<T>(content: string, fallback: T): T {
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
