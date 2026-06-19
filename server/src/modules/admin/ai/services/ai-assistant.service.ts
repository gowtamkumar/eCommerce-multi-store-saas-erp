import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { maskApiKey, normalizeTenantAiConfig } from '@/modules/system/tenant/utils/tenant-ai.util'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AiChatDto } from '../dto/ai-chat.dto'
import { DashboardCopilotDto } from '../dto/dashboard-copilot.dto'
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../dto/generate-campaign-copy.dto'
import {
  CatalogContentResultDto,
  GenerateCatalogContentDto,
} from '../dto/generate-catalog-content.dto'
import { FaqContentResultDto, GenerateFaqDto } from '../dto/generate-faq.dto'
import { GenerateLeadFollowUpDto, LeadFollowUpResultDto } from '../dto/generate-lead-follow-up.dto'
import {
  GenerateLoyaltyCopyDto,
  LoyaltyProgramCopyResultDto,
  LoyaltyRuleCopyResultDto,
} from '../dto/generate-loyalty-copy.dto'
import {
  GenerateMarketingDescriptionDto,
  MarketingDescriptionResultDto,
} from '../dto/generate-marketing-description.dto'
import { GenerateOrderAssistDto, OrderAssistResultDto } from '../dto/generate-order-assist.dto'
import {
  GenerateReviewAssistDto,
  ReviewAssistResultDto,
} from '../dto/generate-review-assist.dto'
import {
  GenerateReturnAssistDto,
  ReturnAssistResultDto,
} from '../dto/generate-return-assist.dto'
import {
  GenerateBatchWasteReductionDto,
  BatchWasteReductionResultDto,
} from '../dto/generate-batch-waste-reduction.dto'
import {
  GeneratePackingSlipNotesDto,
  PackingSlipNotesResultDto,
} from '../dto/generate-packing-slip-notes.dto'
import {
  GenerateCycleCountVarianceDto,
  CycleCountVarianceResultDto,
} from '../dto/generate-cycle-count-variance.dto'
import {
  GenerateStockTransferReasonDto,
  StockTransferReasonResultDto,
} from '../dto/generate-stock-transfer-reason.dto'
import {
  GenerateInventoryAnomalyDto,
  InventoryAnomalyResultDto,
} from '../dto/generate-inventory-anomaly.dto'
import {
  GenerateMediaAssistDto,
  MediaAssistResultDto,
} from '../dto/generate-media-assist.dto'
import {
  GeneratePriceBookRationaleDto,
  PriceBookRationaleResultDto,
} from '../dto/generate-price-book-rationale.dto'
import {
  AbandonedCartMessageResultDto,
  GenerateAbandonedCartMessageDto,
} from '../dto/generate-abandoned-cart-message.dto'
import {
  GenerateCustomerProfileDto,
  CustomerProfileResultDto,
} from '../dto/generate-customer-profile.dto'
import {
  GenerateSupportReplyDto,
  SupportReplyResultDto,
} from '../dto/generate-support-reply.dto'
import {
  GeneratePageBlockContentDto,
  PageBlockContentResultDto,
} from '../dto/generate-page-block-content.dto'
import { GeneratePageSeoDto, PageSeoResultDto } from '../dto/generate-page-seo.dto'
import {
  GenerateProductContentDto,
  ProductContentResultDto,
} from '../dto/generate-product-content.dto'
import { GenerateStoreSeoDto, StoreSeoResultDto } from '../dto/generate-store-seo.dto'
import {
  buildDashboardCopilotMessages,
  buildDashboardKpiSnapshot,
} from '../utils/dashboard-kpi-context.util'
import { AiChatMessage, TenantAiClientService } from './tenant-ai-client.service'

const ASSISTANT_SYSTEM_PROMPT = `You are a helpful e-commerce and ERP assistant for store administrators.
Help with product ideas, marketing copy, operations questions, and business decisions.
Be concise, practical, and action-oriented. Never invent inventory, orders, or financial data.`

@Injectable()
export class AiAssistantService {
  constructor(
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

    const result = await this.aiClient.chatCompletion(tenantId, messages)
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

    const result = await this.aiClient.chatCompletion(ctx.tenantId, messages as AiChatMessage[], {
      temperature: 0.3,
    })

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

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You are an SEO specialist for e-commerce stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.55 },
    )

    return this.parseJsonResponse<StoreSeoResultDto>(result.content, {
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

      const result = await this.aiClient.chatCompletion(
        tenantId,
        [
          {
            role: 'system',
            content:
              'You name e-commerce loyalty promotion rules. Respond with valid JSON only, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.5 },
      )

      return this.parseJsonResponse<LoyaltyRuleCopyResultDto>(result.content, { name: '' })
    }

    const prompt = `Generate customer-facing loyalty program copy as JSON only (no markdown fences).
${dto.offerSummary ? `Program details: ${dto.offerSummary}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: friendly and rewarding'}

Return exactly this JSON shape:
{
  "programDescription": "string (2-4 sentences explaining how customers earn and redeem points, mention tiers if provided)",
  "referralMessage": "string (1 sentence inviting friends to join, max 160 chars)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write loyalty program copy for online stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.6 },
    )

    return this.parseJsonResponse<LoyaltyProgramCopyResultDto>(result.content, {
      programDescription: '',
      referralMessage: '',
    })
  }

  async generateLeadFollowUp(
    tenantId: string,
    dto: GenerateLeadFollowUpDto,
  ): Promise<LeadFollowUpResultDto> {
    const intent = dto.intent || 'follow_up'
    const intentLabels: Record<string, string> = {
      welcome: 'welcome / thank-you for subscribing',
      follow_up: 'personal follow-up reply to their inquiry',
      nurture: 'nurture email to keep them engaged',
      conversion: 'conversion nudge encouraging them to become a customer',
    }

    const prompt = `Generate a lead follow-up email as JSON only (no markdown fences).
Lead name: ${dto.leadName}
Lead email: ${dto.leadEmail}
${dto.status ? `Lead status: ${dto.status}` : ''}
${dto.subject ? `Original subject: ${dto.subject}` : ''}
${dto.message ? `Their message: ${dto.message}` : ''}
${dto.brandName ? `Store/brand: ${dto.brandName}` : ''}
Intent: ${intentLabels[intent] || intentLabels.follow_up}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: warm, professional, and helpful'}

Return exactly this JSON shape:
{
  "emailSubject": "string (max 80 chars, personalized)",
  "emailBody": "string (2-4 short paragraphs, plain text with line breaks, no HTML)",
  "smsText": "string (optional short SMS follow-up, max 160 chars)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write personalized lead nurture and newsletter follow-up emails for e-commerce stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.65 },
    )

    return this.parseJsonResponse<LeadFollowUpResultDto>(result.content, {
      emailSubject: dto.subject || `Following up with ${dto.leadName}`,
      emailBody: result.content,
      smsText: '',
    })
  }

  async generateOrderAssist(
    tenantId: string,
    dto: GenerateOrderAssistDto,
  ): Promise<OrderAssistResultDto> {
    if (dto.context === 'status') {
      const prompt = `Explain this order's current status for a store admin as JSON only (no markdown fences).
Customer: ${dto.customerName}
Order status: ${dto.orderStatus}
${dto.paymentStatus ? `Payment status: ${dto.paymentStatus}` : ''}

Order details:
${dto.orderSummary}

Return exactly this JSON shape:
{
  "explanation": "string (2-4 sentences: what the status means, likely cause, and suggested next admin actions — do not change any data)"
}`

      const result = await this.aiClient.chatCompletion(
        tenantId,
        [
          {
            role: 'system',
            content:
              'You help e-commerce operations staff understand order statuses. Respond with valid JSON only, no extra text. Never invent tracking numbers or amounts not in the context.',
          },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.4 },
      )

      return this.parseJsonResponse<OrderAssistResultDto>(result.content, { explanation: '' })
    }

    const templateLabels: Record<string, string> = {
      status_update: 'general order status update',
      shipped: 'shipment dispatched with tracking if available',
      delay: 'apologetic delay notification',
      cancellation: 'order cancellation confirmation',
      payment_issue: 'payment problem or pending payment follow-up',
      general: 'helpful general customer update',
    }
    const template = dto.emailTemplate || 'general'

    const prompt = `Draft a customer-facing order email as JSON only (no markdown fences).
Customer: ${dto.customerName}
${dto.customerEmail ? `Email: ${dto.customerEmail}` : ''}
Order status: ${dto.orderStatus}
${dto.paymentStatus ? `Payment status: ${dto.paymentStatus}` : ''}
Email type: ${templateLabels[template] || templateLabels.general}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, empathetic, and clear'}

Order details:
${dto.orderSummary}

Return exactly this JSON shape:
{
  "emailSubject": "string (max 80 chars)",
  "emailBody": "string (2-4 short paragraphs, plain text with line breaks, no HTML — draft only, admin will send manually)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You draft customer order emails for online stores. Respond with valid JSON only, no extra text. Never promise refunds or changes not stated in the order context.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.55 },
    )

    return this.parseJsonResponse<OrderAssistResultDto>(result.content, {
      emailSubject: `Update on your order`,
      emailBody: result.content,
    })
  }

  async generateReturnAssist(
    tenantId: string,
    dto: GenerateReturnAssistDto,
  ): Promise<ReturnAssistResultDto> {
    const templateLabels: Record<string, string> = {
      approved: 'return request approved — explain next steps for sending items back',
      rejected: 'return request declined — polite explanation with policy context',
      refunded: 'refund processed confirmation with amount and method if provided',
      received: 'return items received — refund or exchange processing underway',
      exchange: 'exchange approved — explain exchange process',
      pending: 'return request received — under review',
      general: 'general return status update',
    }
    const template = dto.letterTemplate || 'general'

    const prompt = `Draft a customer-facing return/refund explanation letter as JSON only (no markdown fences).
Customer: ${dto.customerName}
${dto.customerEmail ? `Email: ${dto.customerEmail}` : ''}
Return status: ${dto.returnStatus}
${dto.returnType ? `Return type: ${dto.returnType}` : ''}
${dto.refundMethod ? `Refund method: ${dto.refundMethod}` : ''}
Letter type: ${templateLabels[template] || templateLabels.general}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: empathetic, professional, and clear'}

Return request details:
${dto.returnSummary}

Return exactly this JSON shape:
{
  "emailSubject": "string (max 80 chars)",
  "emailBody": "string (2-4 short paragraphs, plain text with line breaks, no HTML — draft letter only, admin sends manually; do not invent refund amounts or dates not in context)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You draft return and refund explanation letters for e-commerce stores. Respond with valid JSON only, no extra text. Never promise refund amounts, timelines, or policy exceptions not stated in the context.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.55 },
    )

    return this.parseJsonResponse<ReturnAssistResultDto>(result.content, {
      emailSubject: 'Update on your return request',
      emailBody: result.content,
    })
  }

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

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You draft live support chat replies for e-commerce stores. Respond with valid JSON only, no extra text. Never promise refunds, shipping dates, or order changes not stated in the context. Keep replies conversational and brief.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.55 },
    )

    return this.parseJsonResponse<SupportReplyResultDto>(result.content, {
      suggestedReply: result.content,
    })
  }

  async generateCustomerProfile(
    tenantId: string,
    dto: GenerateCustomerProfileDto,
  ): Promise<CustomerProfileResultDto> {
    const prompt = `Analyze this customer profile for a support and CRM team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: factual, concise, and actionable'}

Customer profile:
${dto.customerSummary}

${dto.ordersSummary ? `Order history:\n${dto.ordersSummary}` : 'No order history provided.'}

${dto.returnsSummary ? `Return history:\n${dto.returnsSummary}` : 'No return history provided.'}

${dto.walletSummary ? `Wallet / store credit:\n${dto.walletSummary}` : 'No wallet data provided.'}

${dto.loyaltySummary ? `Loyalty program:\n${dto.loyaltySummary}` : 'No loyalty data provided.'}

Return exactly this JSON shape:
{
  "supportSummary": "string (3-5 short bullet points as plain text with line breaks — read-only briefing for support agents: who they are, purchase behavior, credit/wallet/loyalty status, and anything to watch for; do not invent data not in context)",
  "segmentLabels": ["string (3-6 short segment tags, e.g. B2B, Repeat buyer, Credit hold, At-risk — each max 4 words)"]
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You produce read-only customer support briefings and segment labels for e-commerce CRM. Respond with valid JSON only, no extra text. Never change customer data or recommend automated actions — insights only.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<CustomerProfileResultDto>(result.content, {
      supportSummary: result.content,
      segmentLabels: [],
    })
  }

  async generateReviewAssist(
    tenantId: string,
    dto: GenerateReviewAssistDto,
  ): Promise<ReviewAssistResultDto> {
    const prompt = `Moderate a product review and draft a public store reply as JSON only (no markdown fences).
Reviewer: ${dto.reviewerName}
Rating: ${dto.rating}/5
${dto.reviewStatus ? `Moderation status: ${dto.reviewStatus}` : ''}
${dto.productName ? `Product: ${dto.productName}` : ''}
${dto.tone ? `Reply tone: ${dto.tone}` : 'Reply tone: warm, professional, and brand-safe'}

Review details:
${dto.reviewSummary}

Return exactly this JSON shape:
{
  "publicReply": "string (2-4 sentences, customer-facing public reply thanking the reviewer and addressing their feedback when relevant — draft only, admin posts manually)",
  "toxicityLevel": "none | low | medium | high",
  "toxicityReason": "string (1 sentence explaining toxicity/policy concern, or 'No concerns' if none)",
  "needsAttention": "boolean (true if toxicity is medium/high, contains harassment, hate speech, spam, or likely fake review signals)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You assist e-commerce review moderation. Respond with valid JSON only, no extra text. Flag toxicity conservatively; human moderators make final decisions. Never auto-approve or reject reviews.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.4 },
    )

    return this.parseJsonResponse<ReviewAssistResultDto>(result.content, {
      publicReply: result.content,
      toxicityLevel: 'none',
      toxicityReason: 'Unable to assess',
      needsAttention: false,
    })
  }

  async generateAbandonedCartMessage(
    tenantId: string,
    dto: GenerateAbandonedCartMessageDto,
  ): Promise<AbandonedCartMessageResultDto> {
    const templateLabels: Record<string, string> = {
      gentle_reminder: 'friendly reminder that items are still in their cart',
      incentive: 'nudge with a soft incentive to complete checkout (do not invent coupon codes)',
      urgency: 'polite urgency about cart items without false scarcity',
      win_back: 'win-back message for a customer who has not checked out',
      general: 'general abandoned cart recovery message',
    }
    const template = dto.messageTemplate || 'gentle_reminder'

    const prompt = `Draft an abandoned cart recovery message as JSON only (no markdown fences).
Customer: ${dto.customerName}
${dto.customerEmail ? `Email: ${dto.customerEmail}` : ''}
${dto.customerPhone ? `Phone: ${dto.customerPhone}` : ''}
${dto.brandName ? `Store/brand: ${dto.brandName}` : ''}
Message style: ${templateLabels[template] || templateLabels.general}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: warm, helpful, and not pushy'}

Cart details:
${dto.cartSummary}

Return exactly this JSON shape:
{
  "emailSubject": "string (max 80 chars, personalized)",
  "emailBody": "string (2-4 short paragraphs, plain text with line breaks, no HTML — mention cart items only when in context; draft only, admin sends manually)",
  "smsText": "string (optional short SMS, max 160 chars)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write abandoned cart recovery emails and SMS for e-commerce stores. Respond with valid JSON only, no extra text. Never invent discounts, coupon codes, or checkout links not in context.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.6 },
    )

    return this.parseJsonResponse<AbandonedCartMessageResultDto>(result.content, {
      emailSubject: 'You left something in your cart',
      emailBody: result.content,
      smsText: '',
    })
  }

  async generatePriceBookRationale(
    tenantId: string,
    dto: GeneratePriceBookRationaleDto,
  ): Promise<PriceBookRationaleResultDto> {
    const prompt = `Write internal pricing rationale notes for a commerce team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: clear, practical, and finance-friendly'}

Price book:
${dto.priceBookSummary}

${dto.catalogSummary ? `Other price books in catalog:\n${dto.catalogSummary}` : 'No other price book context provided.'}

Return exactly this JSON shape:
{
  "rationaleNotes": "string (3-5 bullet points as plain text with line breaks — why this price book exists, intended audience, pricing strategy, and validity implications; internal only)",
  "usageGuidance": "string (1-2 sentences on when sales/ops should apply this book vs others; do not invent product prices)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You document B2B and retail price book strategy for ERP teams. Respond with valid JSON only, no extra text. Notes are internal — not customer-facing.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<PriceBookRationaleResultDto>(result.content, {
      rationaleNotes: result.content,
      usageGuidance: '',
    })
  }

  async generateMediaAssist(
    tenantId: string,
    dto: GenerateMediaAssistDto,
  ): Promise<MediaAssistResultDto> {
    const isImage = dto.mimetype?.startsWith('image/') ?? false
    const useVision = Boolean(dto.useVision && dto.imageUrl && isImage)

    const prompt = `Suggest accessibility alt text and an SEO-friendly filename for a media library asset as JSON only (no markdown fences).
Current filename: ${dto.filename}
${dto.mimetype ? `MIME type: ${dto.mimetype}` : ''}
${dto.contextHint ? `Usage context: ${dto.contextHint}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: descriptive and concise'}

File details:
${dto.mediaSummary}

${useVision ? 'Analyze the attached image when describing visible content.' : 'No vision analysis — infer from filename and metadata only.'}

Return exactly this JSON shape:
{
  "altText": "string (max 125 chars, accessibility-focused, describes the image content)",
  "suggestedFilename": "string (lowercase kebab-case with extension, SEO-friendly, no timestamp prefix, e.g. blue-cotton-tshirt-front.jpg)",
  "visionUsed": ${useVision ? 'true' : 'false'}
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write image alt text and SEO filenames for e-commerce media libraries. Respond with valid JSON only, no extra text. Do not invent brand names or products not visible or implied.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.4,
        imageUrl: useVision ? dto.imageUrl : undefined,
      },
    )

    return this.parseJsonResponse<MediaAssistResultDto>(result.content, {
      altText: '',
      suggestedFilename: dto.filename,
      visionUsed: useVision,
    })
  }

  async generateInventoryAnomaly(
    tenantId: string,
    dto: GenerateInventoryAnomalyDto,
  ): Promise<InventoryAnomalyResultDto> {
    const prompt = `Explain inventory anomalies for a store operations team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: factual, concise, and actionable for ops review'}

Dashboard stats:
${dto.statsSummary}

${dto.activeFilter ? `Active list filter: ${dto.activeFilter}` : ''}

Stock snapshot (at-risk and notable SKUs):
${dto.stockSummary}

${dto.recentMovementsSummary ? `Recent inventory movements:\n${dto.recentMovementsSummary}` : 'No recent movement history provided.'}

Return exactly this JSON shape:
{
  "narrative": "string (3-5 short paragraphs as plain text with line breaks — read-only summary of stock health, patterns, and likely causes; do not invent quantities or SKUs not in context; suggest where to investigate in admin e.g. Fulfillment, Purchase Orders, Cycle Count — never recommend automatic stock changes)",
  "anomalyHighlights": ["string (3-8 bullet-style one-liners flagging specific anomalies e.g. out-of-stock bestsellers, high reserved vs available, category clusters)"]
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You explain inventory and stock anomalies for e-commerce ERP dashboards. Respond with valid JSON only, no extra text. Read-only insights — never adjust inventory or promise stock levels not in context.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<InventoryAnomalyResultDto>(result.content, {
      narrative: result.content,
      anomalyHighlights: [],
    })
  }

  async generateStockTransferReason(
    tenantId: string,
    dto: GenerateStockTransferReasonDto,
  ): Promise<StockTransferReasonResultDto> {
    const prompt = `Draft stock transfer reason notes for a warehouse operations team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, concise, audit-friendly'}

Transfer context:
${dto.transferSummary}

${dto.existingRemarks ? `Existing remarks (refine or replace as appropriate):\n${dto.existingRemarks}` : 'No existing remarks.'}

Return exactly this JSON shape:
{
  "reasonNotes": "string (1-3 sentences suitable for the transfer document remarks field — state why stock is moving between warehouses, business driver, and urgency if implied; do not invent SKUs or quantities not in context)",
  "auditSummary": "string (2-4 bullet points as plain text with line breaks — internal audit context: route rationale, item mix summary, and any compliance or reconciliation notes; internal only)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write warehouse stock transfer reason notes for multi-location e-commerce ERP teams. Respond with valid JSON only, no extra text. Draft notes only — admin saves manually to the transfer document.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<StockTransferReasonResultDto>(result.content, {
      reasonNotes: result.content,
      auditSummary: '',
    })
  }

  async generateCycleCountVariance(
    tenantId: string,
    dto: GenerateCycleCountVarianceDto,
  ): Promise<CycleCountVarianceResultDto> {
    const prompt = `Explain cycle count variances for a warehouse operations team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: factual, concise, and audit-friendly'}

Cycle count session:
${dto.countSummary}

Variance lines (system stock vs physical count):
${dto.varianceSummary}

${dto.recentMovementsSummary ? `Recent inventory movements at this warehouse:\n${dto.recentMovementsSummary}` : 'No recent movement history provided.'}

Return exactly this JSON shape:
{
  "narrative": "string (3-5 short paragraphs as plain text with line breaks — read-only explanation of why discrepancies may exist, patterns across SKUs, and suggested investigation steps e.g. receiving errors, shrinkage, mis-picks, unposted transfers; do not invent quantities or SKUs not in context; never recommend automatic adjustments)",
  "varianceHighlights": ["string (3-8 bullet-style one-liners flagging specific variances e.g. large negative delta, multiple SKUs short, over-count patterns)"]
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You explain physical inventory cycle count variances for e-commerce warehouse teams. Respond with valid JSON only, no extra text. Read-only insights — never post adjustments or change ledger balances.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<CycleCountVarianceResultDto>(result.content, {
      narrative: result.content,
      varianceHighlights: [],
    })
  }

  async generatePackingSlipNotes(
    tenantId: string,
    dto: GeneratePackingSlipNotesDto,
  ): Promise<PackingSlipNotesResultDto> {
    const prompt = `Draft packing slip notes for a warehouse fulfillment team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: clear, professional, and packer-friendly'}

Fulfillment task:
${dto.fulfillmentSummary}

${dto.orderSummary ? `Order and shipping context:\n${dto.orderSummary}` : 'No additional order context provided.'}

Return exactly this JSON shape:
{
  "packingSlipNotes": "string (2-4 short sentences or bullet-style plain text with line breaks — suitable to print on a packing slip: order summary, item count, destination region hint, and any customer-visible care notes; do not invent items, addresses, or gift messages not in context)",
  "handlingNotes": "string (2-4 bullet points as plain text with line breaks — internal warehouse instructions for pickers/packers e.g. fragile items, multi-bin picks, verify quantities, special order notes; internal only)"
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write packing slip and warehouse handling notes for e-commerce fulfillment. Respond with valid JSON only, no extra text. Draft notes only — admin prints or saves manually.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<PackingSlipNotesResultDto>(result.content, {
      packingSlipNotes: result.content,
      handlingNotes: '',
    })
  }

  async generateBatchWasteReduction(
    tenantId: string,
    dto: GenerateBatchWasteReductionDto,
  ): Promise<BatchWasteReductionResultDto> {
    const prompt = `Suggest batch and expiry waste reduction tips for an e-commerce inventory team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: practical, ops-focused, and waste-conscious'}

Registry stats:
${dto.statsSummary}

${dto.activeFilter ? `Active list filter: ${dto.activeFilter}` : ''}

Batch snapshot (FEFO / expiry risk):
${dto.batchSummary}

Return exactly this JSON shape:
{
  "wasteReductionTips": "string (3-5 short paragraphs as plain text with line breaks — read-only tips on reducing spoilage and write-offs: FEFO picking, markdown/promo timing for near-expiry stock, transfer or bundle ideas, reorder cadence hints using simple demand heuristics; tie suggestions to batches in context; do not invent SKUs, quantities, or ML forecast outputs; never auto-adjust batches or ledger)",
  "priorityActions": ["string (3-8 bullet-style one-liners — highest-impact actions this week e.g. ship oldest batch first, run promo on SKUs expiring in 14 days, sweep expired stock)"]
}`

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You advise e-commerce teams on perishable and batch-tracked inventory waste reduction. Respond with valid JSON only, no extra text. Heuristic forecasting tie-in only — no automated stock changes.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.45 },
    )

    return this.parseJsonResponse<BatchWasteReductionResultDto>(result.content, {
      wasteReductionTips: result.content,
      priorityActions: [],
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

    const result = await this.aiClient.chatCompletion(
      tenantId,
      [
        {
          role: 'system',
          content: 'You are an e-commerce marketer. Respond with valid JSON only, no extra text.',
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
