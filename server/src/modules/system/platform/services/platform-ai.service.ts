import { Injectable } from '@nestjs/common'
import {
  GeneratePlanDescriptionDto,
  PlanDescriptionResultDto,
} from '../dto/generate-plan-description.dto'
import { PlatformAiClientService } from './platform-ai-client.service'
import { TenantHealthAggregate } from '@/modules/system/super-admin/types/tenant-health.types'
import {
  TenantHealthNarrativeResultDto,
} from '@/modules/system/super-admin/dto/tenant-health.dto'

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

Audience: merchants evaluating a multi-tenant e-commerce / ERP SaaS platform.
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

  async generateTenantHealthNarrative(
    snapshot: TenantHealthAggregate,
  ): Promise<Omit<TenantHealthNarrativeResultDto, 'snapshot'>> {
    const prompt = `Analyze platform tenant health and churn risk using ONLY the aggregate metrics below.
Do NOT invent individual merchant names, emails, or identifiers. This is a Super Admin SaaS platform overview.

Metrics JSON:
${JSON.stringify(snapshot, null, 2)}

Write an executive churn-risk narrative for the platform operator as JSON only (no markdown fences).

Rules:
- Use only the provided aggregate counts and percentages you can derive from them
- Flag billing, trial conversion, engagement, and subscription status risks
- recommendedActions must be operational (e.g. dunning, trial outreach) without naming tenants
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
            'You are a B2B SaaS customer success analyst. Respond with valid JSON only, no extra text. Never reference individual tenants.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.4, maxTokens: 900 },
    )

    return this.parseJsonResponse<Omit<TenantHealthNarrativeResultDto, 'snapshot'>>(result.content, {
      summary: result.content.slice(0, 600),
      riskLevel: 'moderate',
      keySignals: [],
      recommendedActions: [],
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
