import { maskApiKey, normalizeTenantAiConfig } from '@/modules/system/tenant/utils/tenant-ai.util'
import { Injectable } from '@nestjs/common'
import { AiChatDto } from '../dto/ai-chat.dto'
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../dto/generate-campaign-copy.dto'
import {
  CatalogContentResultDto,
  GenerateCatalogContentDto,
} from '../dto/generate-catalog-content.dto'
import { FaqContentResultDto, GenerateFaqDto } from '../dto/generate-faq.dto'
import {
  GenerateMarketingDescriptionDto,
  MarketingDescriptionResultDto,
} from '../dto/generate-marketing-description.dto'
import { GeneratePageSeoDto, PageSeoResultDto } from '../dto/generate-page-seo.dto'
import {
  GeneratePageBlockContentDto,
  PageBlockContentResultDto,
} from '../dto/generate-page-block-content.dto'
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

  async generateCatalogContent(
    tenantId: string,
    dto: GenerateCatalogContentDto,
  ): Promise<CatalogContentResultDto> {
    const entityLabel = dto.entityType === 'category' ? 'product category' : 'brand'
    const prompt = `Generate ${entityLabel} page content as JSON only (no markdown fences).
${entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} name: ${dto.name}
${dto.context ? `Context: ${dto.context}` : ''}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.existingDescription ? `Existing description to improve: ${dto.existingDescription}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional'}

Return exactly this JSON shape:
{
  "description": "string (2-3 sentences, plain text, customer-facing)",
  "seoTitle": "string (max 60 chars)",
  "seoDescription": "string (max 155 chars)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert e-commerce SEO copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.6 },
    )

    return this.parseJsonResponse<CatalogContentResultDto>(result.content, {
      description: result.content,
      seoTitle: dto.name,
      seoDescription: '',
    })
  }

  async generateCampaignCopy(
    tenantId: string,
    dto: GenerateCampaignCopyDto,
  ): Promise<CampaignCopyResultDto> {
    const channel = dto.channel || 'both'
    const fields: string[] = []
    if (channel === 'email' || channel === 'both') {
      fields.push('"emailSubject": "string",', '"emailBody": "string (HTML with p/br only)",')
    }
    if (channel === 'sms' || channel === 'both') {
      fields.push('"smsText": "string (max 160 chars)",')
    }
    if (channel === 'push') {
      fields.push(
        '"pushTitle": "string (max 50 chars)",',
        '"pushBody": "string (max 120 chars)",',
      )
    }

    const prompt = `Generate marketing campaign copy as JSON only (no markdown fences).
Campaign: ${dto.campaignName}
${dto.audience ? `Audience: ${dto.audience}` : ''}
${dto.offerDetails ? `Offer: ${dto.offerDetails}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: friendly and persuasive'}
Channel: ${channel}

Return exactly this JSON shape:
{
  ${fields.join('\n  ')}
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert email, SMS, and push notification marketer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.7 },
    )

    return this.parseJsonResponse<CampaignCopyResultDto>(result.content, {})
  }

  async generateFaq(tenantId: string, dto: GenerateFaqDto): Promise<FaqContentResultDto> {
    const prompt = `Generate an FAQ entry as JSON only (no markdown fences).
Topic: ${dto.topic}
${dto.category ? `Category: ${dto.category}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: helpful and clear'}

Return exactly this JSON shape:
{
  "question": "string (clear customer-facing question)",
  "answer": "string (2-4 sentences, plain text)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an e-commerce support writer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5 },
    )

    return this.parseJsonResponse<FaqContentResultDto>(result.content, {
      question: dto.topic,
      answer: result.content,
    })
  }

  async generatePageSeo(tenantId: string, dto: GeneratePageSeoDto): Promise<PageSeoResultDto> {
    const prompt = `Generate SEO metadata for a store page as JSON only (no markdown fences).
Page title: ${dto.pageTitle}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional'}

Return exactly this JSON shape:
{
  "metaTitle": "string (max 60 chars)",
  "metaDescription": "string (max 155 chars)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content: 'You are an SEO specialist. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5 },
    )

    return this.parseJsonResponse<PageSeoResultDto>(result.content, {
      metaTitle: dto.pageTitle,
      metaDescription: '',
    })
  }

  async generatePageBlockContent(
    tenantId: string,
    dto: GeneratePageBlockContentDto,
  ): Promise<PageBlockContentResultDto> {
    const jsonShapes: Record<GeneratePageBlockContentDto['blockType'], string> = {
      heading: '"text": "string (concise headline, max 80 chars)"',
      paragraph: '"text": "string (2-4 sentences, plain text)"',
      button:
        '"text": "string (CTA label, max 30 chars)",\n  "link": "string (relative path like /shop, /offers, or #)"',
      'text-block':
        '"headline": "string (hero headline)",\n  "subline": "string (short tagline, optional)",\n  "html": "string (2-3 paragraphs, HTML with p tags only)"',
    }

    const prompt = `Generate storefront page block copy as JSON only (no markdown fences).
Block type: ${dto.blockType}
${dto.pageTitle ? `Page title: ${dto.pageTitle}` : ''}
${dto.topic ? `Topic: ${dto.topic}` : ''}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.existingText ? `Existing text to improve: ${dto.existingText}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional and engaging'}

Return exactly this JSON shape:
{
  ${jsonShapes[dto.blockType]}
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert e-commerce landing page copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.65 },
    )

    return this.parseJsonResponse<PageBlockContentResultDto>(result.content, {})
  }

  async generateMarketingDescription(
    tenantId: string,
    dto: GenerateMarketingDescriptionDto,
  ): Promise<MarketingDescriptionResultDto> {
    const context = dto.context === 'coupon' ? 'discount coupon' : 'promotional offer'
    const prompt = `Write a short marketing description as JSON only (no markdown fences).
Name: ${dto.name}
${dto.offerSummary ? `Offer details: ${dto.offerSummary}` : ''}
Context: ${context}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: enticing and clear'}

Return exactly this JSON shape:
{
  "description": "string (1-2 sentences, max 200 chars, customer-facing)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an e-commerce marketer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.6 },
    )

    return this.parseJsonResponse<MarketingDescriptionResultDto>(result.content, {
      description: result.content.slice(0, 200),
    })
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
