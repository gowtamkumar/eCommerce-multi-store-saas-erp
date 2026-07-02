import { Injectable } from '@nestjs/common'
import {
  GeneratePlanDescriptionDto,
  PlanDescriptionResultDto,
} from '../dto/generate-plan-description.dto'
import { PlatformAiClientService } from './platform-ai-client.service'
import { StoreHealthAggregate } from '@/modules/system/super-admin/types/store-health.types'
import {
  StoreHealthNarrativeResultDto,
} from '@/modules/system/super-admin/dto/store-health.dto'
import {
  GenerateOnboardingHintsDto,
  OnboardingHintsResultDto,
} from '../dto/generate-onboarding-hints.dto'
import {
  GenerateSupportTicketSummaryDto,
  SupportTicketSummaryResultDto,
} from '../dto/generate-support-ticket-summary.dto'

@Injectable()
export class PlatformAiService {
  constructor(private readonly platformAiClient: PlatformAiClientService) {}

  async isConfigured(): Promise<boolean> {
    return this.platformAiClient.isConfigured()
  }

  async generatePlanDescription(
    dto: GeneratePlanDescriptionDto,
  ): Promise<PlanDescriptionResultDto> {
    const currency = dto.currency?.toUpperCase() || 'USD'
    const featureList =
      dto.features?.length && dto.features.length > 0
        ? dto.features.slice(0, 40).join(', ')
        : 'core platform modules'

    const prompt = `Write SaaS subscription plan marketing copy as JSON only (no markdown fences).
Plan name: ${dto.planName}
${dto.monthlyPrice != null ? `Monthly price: ${currency} ${dto.monthlyPrice}` : ''}
${dto.yearlyPrice != null ? `Yearly price: ${currency} ${dto.yearlyPrice}` : ''}
${dto.trialPeriodDays != null ? `Free trial: ${dto.trialPeriodDays} days` : ''}
${dto.isPopular ? 'This tier is highlighted as "Most Popular".' : ''}
Included feature modules: ${featureList}
${dto.quotaSummary ? `Resource limits: ${dto.quotaSummary}` : ''}
${dto.existingDescription ? `Existing description to improve or replace: ${dto.existingDescription}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: confident, clear, and conversion-focused'}

Audience: merchants evaluating a multi-store e-commerce / ERP SaaS platform.
Write customer-facing pricing page copy — not internal technical notes.

Return exactly this JSON shape:
{
  "description": "string (2-3 sentences, max 320 chars, compelling value proposition for this tier)"
}`

    const result = await this.platformAiClient.chatCompletion(
      [
        {
          role: 'system',
          content:
            'You are a B2B SaaS pricing page copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.65 },
    )

    return this.parseJsonResponse<PlanDescriptionResultDto>(result.content, {
      description: result.content.slice(0, 320),
    })
  }

  async generateStoreHealthNarrative(
    snapshot: StoreHealthAggregate,
  ): Promise<Omit<StoreHealthNarrativeResultDto, 'snapshot'>> {
    const prompt = `Analyze platform store health and churn risk using ONLY the aggregate metrics below.
Do NOT invent individual merchant names, emails, or identifiers. This is a Super Admin SaaS platform overview.

Metrics JSON:
${JSON.stringify(snapshot, null, 2)}

Write an executive churn-risk narrative for the platform operator as JSON only (no markdown fences).

Rules:
- Use only the provided aggregate counts and percentages you can derive from them
- Flag billing, trial conversion, engagement, and subscription status risks
- recommendedActions must be operational (e.g. dunning, trial outreach) without naming stores
- riskLevel: low | moderate | elevated | critical

Return exactly this JSON shape:
{
  "summary": "string (2-4 sentences, executive tone)",
  "riskLevel": "low|moderate|elevated|critical",
  "keySignals": ["string (max 6 bullets, aggregate facts only)"],
  "recommendedActions": ["string (max 5 actionable platform-level steps)"]
}`

    const result = await this.platformAiClient.chatCompletion(
      [
        {
          role: 'system',
          content:
            'You are a B2B SaaS customer success analyst. Respond with valid JSON only, no extra text. Never reference individual stores.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.4, maxTokens: 900 },
    )

    return this.parseJsonResponse<Omit<StoreHealthNarrativeResultDto, 'snapshot'>>(result.content, {
      summary: result.content.slice(0, 600),
      riskLevel: 'moderate',
      keySignals: [],
      recommendedActions: [],
    })
  }

  async generateSupportTicketSummary(
    dto: GenerateSupportTicketSummaryDto,
  ): Promise<SupportTicketSummaryResultDto> {
    const prompt = `Summarize a platform support ticket for a Super Admin operator as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: clear, neutral, and actionable'}

Conversation / ticket notes:
${dto.conversationText}

${dto.storeContext ? `Store context:\n${dto.storeContext}` : 'No store context provided.'}
${dto.issueSummary ? `Issue reference:\n${dto.issueSummary}` : ''}

Return exactly this JSON shape:
{
  "ticketSummary": "string (3-5 sentences for internal handoff — facts only from transcript)",
  "customerIntentTags": ["string (max 6 short intent labels e.g. billing, onboarding, bug)"],
  "suggestedNextSteps": ["string (max 5 concrete support steps — no auto-actions)"],
  "escalationHint": "string (when to escalate to engineering or billing, 1-2 sentences)"
}

Rules: Do not invent order ids, emails, or store facts not in the input. Draft for human agents only.`

    const result = await this.platformAiClient.chatCompletion(
      [
        {
          role: 'system',
          content:
            'You summarize B2B SaaS support tickets for platform operators. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.35, maxTokens: 900 },
    )

    return this.parseJsonResponse<SupportTicketSummaryResultDto>(result.content, {
      ticketSummary: result.content.slice(0, 800),
      customerIntentTags: [],
      suggestedNextSteps: [],
      escalationHint: 'Review transcript manually before replying.',
    })
  }

  async generateOnboardingHints(
    dto: GenerateOnboardingHintsDto,
  ): Promise<OnboardingHintsResultDto> {
    const prompt = `Write onboarding guidance for a new merchant on a multi-store e-commerce / ERP SaaS platform as JSON only (no markdown fences).
Store name: ${dto.storeName}
${dto.subdomain ? `Subdomain: ${dto.subdomain}` : ''}
${dto.planName ? `Plan: ${dto.planName}` : ''}
${dto.enabledFeatures ? `Enabled modules: ${dto.enabledFeatures}` : ''}
${dto.merchantProfile ? `Merchant profile: ${dto.merchantProfile}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: welcoming and practical'}

Audience: store owner setting up their store for the first time.
Do not invent integrations or features not implied by enabled modules.

Return exactly this JSON shape:
{
  "welcomeSummary": "string (2-3 sentences)",
  "setupChecklist": ["string (max 8 ordered setup steps for week 1)"],
  "firstWeekTips": ["string (max 5 tips)"],
  "supportResourcesHint": "string (where to get help — docs, settings, support — generic platform wording)"
}`

    const result = await this.platformAiClient.chatCompletion(
      [
        {
          role: 'system',
          content:
            'You write merchant onboarding playbooks for e-commerce SaaS platforms. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.55, maxTokens: 900 },
    )

    return this.parseJsonResponse<OnboardingHintsResultDto>(result.content, {
      welcomeSummary: result.content.slice(0, 400),
      setupChecklist: [],
      firstWeekTips: [],
      supportResourcesHint: 'Use in-app documentation and platform support for help.',
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
