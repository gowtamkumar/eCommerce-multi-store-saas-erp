import { Injectable } from '@nestjs/common'
import {
  AbandonedCartMessageResultDto,
  GenerateAbandonedCartMessageDto,
} from '../../dto/generate-abandoned-cart-message.dto'
import {
  CustomerProfileResultDto,
  GenerateCustomerProfileDto,
} from '../../dto/generate-customer-profile.dto'
import { GenerateLeadFollowUpDto, LeadFollowUpResultDto } from '../../dto/generate-lead-follow-up.dto'
import { GenerateReviewAssistDto, ReviewAssistResultDto } from '../../dto/generate-review-assist.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiCrmAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write personalized lead nurture and newsletter follow-up emails for e-commerce stores. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/lead-follow-up',
      { temperature: 0.65 },
    )

    return this.base.parseJsonResponse<LeadFollowUpResultDto>(result.content, {
      emailSubject: dto.subject || `Following up with ${dto.leadName}`,
      emailBody: result.content,
      smsText: '',
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You produce read-only customer support briefings and segment labels for e-commerce CRM. Respond with valid JSON only, no extra text. Never change customer data or recommend automated actions — insights only.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/customer-profile',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<CustomerProfileResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You assist e-commerce review moderation. Respond with valid JSON only, no extra text. Flag toxicity conservatively; human moderators make final decisions. Never auto-approve or reject reviews.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/review-assist',
      { temperature: 0.4 },
    )

    return this.base.parseJsonResponse<ReviewAssistResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write abandoned cart recovery emails and SMS for e-commerce stores. Respond with valid JSON only, no extra text. Never invent discounts, coupon codes, or checkout links not in context.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/abandoned-cart-message',
      { temperature: 0.6 },
    )

    return this.base.parseJsonResponse<AbandonedCartMessageResultDto>(result.content, {
      emailSubject: 'You left something in your cart',
      emailBody: result.content,
      smsText: '',
    })
  }
}
