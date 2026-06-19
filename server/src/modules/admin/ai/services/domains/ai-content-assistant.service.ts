import { Injectable } from '@nestjs/common'
import {
  CouponCodeSuggestionsResultDto,
  GenerateCouponCodeSuggestionsDto,
} from '../../dto/generate-coupon-code-suggestions.dto'
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../../dto/generate-campaign-copy.dto'
import { FaqContentResultDto, GenerateFaqDto } from '../../dto/generate-faq.dto'
import {
  GenerateLoyaltyCopyDto,
  LoyaltyProgramCopyResultDto,
  LoyaltyRuleCopyResultDto,
} from '../../dto/generate-loyalty-copy.dto'
import {
  GenerateMarketingDescriptionDto,
  MarketingDescriptionResultDto,
} from '../../dto/generate-marketing-description.dto'
import {
  GeneratePageBlockContentDto,
  PageBlockContentResultDto,
} from '../../dto/generate-page-block-content.dto'
import { GeneratePageSeoDto, PageSeoResultDto } from '../../dto/generate-page-seo.dto'
import { GenerateStoreSeoDto, StoreSeoResultDto } from '../../dto/generate-store-seo.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiContentAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

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
      fields.push('"pushTitle": "string (max 50 chars)",', '"pushBody": "string (max 120 chars)",')
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert email, SMS, and push notification marketer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/campaign-copy',
      { temperature: 0.7 },
    )

    return this.base.parseJsonResponse<CampaignCopyResultDto>(result.content, {})
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an e-commerce support writer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/faq',
      { temperature: 0.5 },
    )

    return this.base.parseJsonResponse<FaqContentResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content: 'You are an SEO specialist. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/page-seo',
      { temperature: 0.5 },
    )

    return this.base.parseJsonResponse<PageSeoResultDto>(result.content, {
      metaTitle: dto.pageTitle,
      metaDescription: '',
    })
  }

  async generateStoreSeo(tenantId: string, dto: GenerateStoreSeoDto): Promise<StoreSeoResultDto> {
    const prompt = `Generate default storefront SEO for an e-commerce store as JSON only (no markdown fences).
Store / brand name: ${dto.brandName}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.existingDescription ? `Existing description to improve: ${dto.existingDescription}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional and trustworthy'}

This is the site-wide default used on the home page and as fallback for social sharing.

Return exactly this JSON shape:
{
  "metaTitle": "string (max 60 chars, include brand name)",
  "metaDescription": "string (max 155 chars, compelling store summary)"
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an SEO specialist for e-commerce stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/store-seo',
      { temperature: 0.55 },
    )

    return this.base.parseJsonResponse<StoreSeoResultDto>(result.content, {
      metaTitle: dto.brandName,
      metaDescription: dto.existingDescription || '',
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an expert e-commerce landing page copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/page-block-content',
      { temperature: 0.65 },
    )

    return this.base.parseJsonResponse<PageBlockContentResultDto>(result.content, {})
  }

  async generateLoyaltyCopy(
    tenantId: string,
    dto: GenerateLoyaltyCopyDto,
  ): Promise<LoyaltyProgramCopyResultDto | LoyaltyRuleCopyResultDto> {
    if (dto.context === 'rule') {
      const prompt = `Generate an internal loyalty rule name as JSON only (no markdown fences).
Rule type: ${dto.ruleType || 'CUSTOM'}
${dto.offerSummary ? `Rule details: ${dto.offerSummary}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: clear and professional'}

Return exactly this JSON shape:
{
  "name": "string (short admin-facing rule name, max 80 chars)"
}`

      const result = await this.base.complete(
        tenantId,
        [
          {
            role: 'system',
            content:
              'You name e-commerce loyalty promotion rules. Respond with valid JSON only, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
        'ai/generate/loyalty-copy',
        { temperature: 0.5 },
      )

      return this.base.parseJsonResponse<LoyaltyRuleCopyResultDto>(result.content, { name: '' })
    }

    const prompt = `Generate customer-facing loyalty program copy as JSON only (no markdown fences).
${dto.offerSummary ? `Program details: ${dto.offerSummary}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: friendly and rewarding'}

Return exactly this JSON shape:
{
  "programDescription": "string (2-4 sentences explaining how customers earn and redeem points, mention tiers if provided)",
  "referralMessage": "string (1 sentence inviting friends to join, max 160 chars)"
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write loyalty program copy for online stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/loyalty-copy',
      { temperature: 0.6 },
    )

    return this.base.parseJsonResponse<LoyaltyProgramCopyResultDto>(result.content, {
      programDescription: '',
      referralMessage: '',
    })
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content: 'You are an e-commerce marketer. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/marketing-description',
      { temperature: 0.6 },
    )

    return this.base.parseJsonResponse<MarketingDescriptionResultDto>(result.content, {
      description: result.content.slice(0, 200),
    })
  }

  async generateCouponCodeSuggestions(
    tenantId: string,
    dto: GenerateCouponCodeSuggestionsDto,
  ): Promise<CouponCodeSuggestionsResultDto> {
    const count = dto.count ?? 6
    const discountLine =
      dto.discountType === 'free_shipping'
        ? 'Free shipping'
        : dto.discountType && dto.amount != null
          ? `${dto.amount}${dto.discountType === 'percentage' ? '%' : ''} off (${dto.discountType})`
          : undefined

    const prompt = `Suggest memorable e-commerce coupon codes as JSON only (no markdown fences).
${discountLine ? `Discount: ${discountLine}` : ''}
${dto.offerSummary ? `Offer: ${dto.offerSummary}` : ''}
${dto.description ? `Description: ${dto.description}` : ''}
${dto.theme ? `Theme: ${dto.theme}` : ''}

Rules:
- Return exactly ${count} codes in "suggestions"
- Uppercase A-Z and 0-9 only, 6-14 characters, no spaces
- Memorable and on-brand; avoid offensive words
- Do not repeat the same code

Return exactly this JSON shape:
{
  "suggestions": ["CODE1", "CODE2"]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You name discount coupon codes for online stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/coupon-code-suggestions',
      { temperature: 0.8 },
    )

    const parsed = this.base.parseJsonResponse<CouponCodeSuggestionsResultDto>(result.content, {
      suggestions: [],
    })

    const seen = new Set<string>()
    const suggestions = (parsed.suggestions ?? [])
      .map((code) => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14))
      .filter((code) => code.length >= 6 && !seen.has(code) && (seen.add(code), true))
      .slice(0, count)

    return { suggestions }
  }
}
