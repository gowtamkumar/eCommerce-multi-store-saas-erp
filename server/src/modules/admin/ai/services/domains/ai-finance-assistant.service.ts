import { ExpenseCategory } from '@/common/enums/expense-category.enum'
import { Injectable } from '@nestjs/common'
import {
  ApPaymentReminderResultDto,
  GenerateApPaymentReminderDto,
} from '../../dto/generate-ap-payment-reminder.dto'
import {
  ArCollectionDraftResultDto,
  GenerateArCollectionDraftDto,
} from '../../dto/generate-ar-collection-draft.dto'
import {
  ExpenseCategorySuggestResultDto,
  GenerateExpenseCategoryDto,
} from '../../dto/generate-expense-category.dto'
import {
  GenerateReportExecutiveSummaryDto,
  ReportExecutiveSummaryResultDto,
} from '../../dto/generate-report-executive-summary.dto'
import {
  GenerateTaxRuleExplanationDto,
  TaxRuleExplanationResultDto,
} from '../../dto/generate-tax-rule-explanation.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiFinanceAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

  async generateArCollectionDraft(
    storeId: string,
    dto: GenerateArCollectionDraftDto,
  ): Promise<ArCollectionDraftResultDto> {
    const prompt = `Draft an accounts receivable collection email for a B2B finance team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, firm but courteous — escalate urgency based on aging buckets in context'}

Customer AR context:
${dto.customerSummary}

Overdue invoice lines:
${dto.overdueInvoicesSummary}

${dto.existingDraft ? `Existing email draft (refine or replace):\n${dto.existingDraft}` : 'No existing email draft.'}

Return exactly this JSON shape:
{
  "emailSubject": "string (max 80 chars, references overdue balance or invoice refs from context only)",
  "emailBody": "string (3-5 short paragraphs as plain text with line breaks — customer-facing collection email requesting payment, listing overdue amounts/buckets from context, payment options, and contact for disputes; do not invent invoice numbers, amounts, or dates not in context; never threaten legal action unless 90+ bucket is significant)",
  "internalNotes": "string (2-4 bullet points as plain text with line breaks — internal finance reminders e.g. follow up in 7 days, credit hold if no response, attach statement; internal only)"
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You write B2B accounts receivable collection emails for e-commerce finance teams. Respond with valid JSON only, no extra text. Draft only — finance sends manually; never post payments or change ledger balances automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/ar-collection-draft',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<ArCollectionDraftResultDto>(result.content, {
      emailSubject: 'Payment reminder',
      emailBody: result.content,
      internalNotes: '',
    })
  }

  async generateApPaymentReminder(
    storeId: string,
    dto: GenerateApPaymentReminderDto,
  ): Promise<ApPaymentReminderResultDto> {
    const prompt = `Draft an internal accounts payable payment approval reminder for a finance team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, concise, and action-oriented — internal only, not supplier-facing'}

AP context:
${dto.apSummary}

Unpaid supplier invoice lines:
${dto.invoicesSummary}

${dto.existingDraft ? `Existing reminder draft (refine or replace):\n${dto.existingDraft}` : 'No existing reminder draft.'}

Return exactly this JSON shape:
{
  "reminderSubject": "string (max 80 chars — internal email/Slack subject e.g. AP approval needed: overdue supplier bills)",
  "reminderBody": "string (3-5 short paragraphs as plain text with line breaks — internal message to approver/finance manager listing suppliers, invoice refs, amounts, due dates, match status concerns, and requested action e.g. approve batch payment run; do not invent invoice numbers or amounts not in context)",
  "actionItems": ["string (2-5 bullet-style one-liners for approver checklist e.g. Verify 3-way match on INV-123, Release payment by Friday)"]
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You write internal accounts payable payment approval reminders for e-commerce finance teams. Respond with valid JSON only, no extra text. Draft only — never post payments or approve invoices automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/ap-payment-reminder',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<ApPaymentReminderResultDto>(result.content, {
      reminderSubject: 'AP payment approval needed',
      reminderBody: result.content,
      actionItems: [],
    })
  }

  async generateExpenseCategorySuggest(
    storeId: string,
    dto: GenerateExpenseCategoryDto,
  ): Promise<ExpenseCategorySuggestResultDto> {
    const categoryOptions = Object.values(ExpenseCategory).join(', ')
    const prompt = `Suggest the best expense category for an e-commerce / retail business expense as JSON only (no markdown fences).

Allowed category values (use exactly one of these slugs): ${categoryOptions}

Category definitions:
- shipping: freight, courier, delivery, last-mile logistics
- packaging: boxes, labels, packing materials, dunnage
- marketing: ads, promotions, influencers, trade shows, creative
- software: SaaS subscriptions, licenses, hosting, dev tools
- salaries: payroll, wages, contractor labor classified as staff cost
- utilities: electricity, water, internet, phone for facilities
- maintenance: repairs, cleaning, equipment servicing, facility upkeep
- other: anything that does not clearly fit the above

Expense context:
${dto.expenseSummary}

${dto.currentCategory ? `Currently selected category: ${dto.currentCategory}` : 'No category selected yet.'}

Return exactly this JSON shape:
{
  "suggestedCategory": "string (one allowed slug only)",
  "confidence": "high | medium | low",
  "reasoning": "string (1-2 sentences explaining the classification based on title/description only — do not invent details not in context)"
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You classify business expenses into predefined accounting categories for e-commerce finance teams. Respond with valid JSON only, no extra text. Suggest only — never post or save expenses automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/expense-category-suggest',
      { temperature: 0.2 },
    )

    const parsed = this.base.parseJsonResponse<ExpenseCategorySuggestResultDto>(result.content, {
      suggestedCategory: ExpenseCategory.OTHER,
      confidence: 'low',
      reasoning: result.content,
    })

    const normalized = String(parsed.suggestedCategory || '')
      .trim()
      .toLowerCase()
    const validCategories = Object.values(ExpenseCategory) as string[]
    const suggestedCategory = validCategories.includes(normalized)
      ? normalized
      : ExpenseCategory.OTHER

    const confidence =
      parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low'
        ? parsed.confidence
        : 'medium'

    return {
      suggestedCategory,
      confidence,
      reasoning: parsed.reasoning?.trim() || 'Suggested based on expense title and description.',
    }
  }

  async generateReportExecutiveSummary(
    storeId: string,
    dto: GenerateReportExecutiveSummaryDto,
  ): Promise<ReportExecutiveSummaryResultDto> {
    const prompt = `Write an executive summary narrative for a business report as JSON only (no markdown fences).
Report type: ${dto.reportType}

CRITICAL RULES:
- Use ONLY numbers, dates, and categories explicitly provided in the report context below.
- Do NOT invent revenue, expenses, margins, counts, trends, or comparisons not in the context.
- If a metric is missing, say it is not provided — do not estimate.
- Read-only narrative for leadership review — no recommendations that change ledger data.

Report context (from database):
${dto.reportSummary}

${dto.existingDraft ? `Existing draft (refine or replace):\n${dto.existingDraft}` : 'No existing draft.'}

Return exactly this JSON shape:
{
  "headline": "string (max 100 chars — one-line takeaway using only provided metrics)",
  "executiveSummary": "string (3-5 short paragraphs as plain text with line breaks — CFO/owner-facing narrative explaining performance, drivers, and margin story using ONLY context numbers)",
  "highlights": ["string (2-4 bullet-style positive or neutral observations tied to specific numbers in context)"],
  "watchItems": ["string (1-3 bullet-style risks or areas to monitor — only if supported by context metrics, otherwise empty array)"]
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You write executive financial report narratives for e-commerce operators. Respond with valid JSON only, no extra text. Never invent metrics — only interpret numbers supplied in the user message. Read-only output.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/report-executive-summary',
      { temperature: 0.35 },
    )

    return this.base.parseJsonResponse<ReportExecutiveSummaryResultDto>(result.content, {
      headline: 'Report summary',
      executiveSummary: result.content,
      highlights: [],
      watchItems: [],
    })
  }

  async generateTaxRuleExplanation(
    storeId: string,
    dto: GenerateTaxRuleExplanationDto,
  ): Promise<TaxRuleExplanationResultDto> {
    const prompt = `Write internal documentation explaining a configured tax/VAT rule for finance admins as JSON only (no markdown fences).

CRITICAL RULES:
- Documentation only — explain what the rule means and when it applies in plain language.
- Do NOT calculate tax amounts, run examples with dollar figures, or perform arithmetic.
- Use ONLY rule attributes provided in context (name, rate, country, state, category, status).
- Do NOT invent jurisdiction laws, filing deadlines, or rates not in context.
- Not legal advice — compliance reminders should be generic (verify with local advisor).

Primary tax rule:
${dto.ruleSummary}

${dto.relatedRulesSummary ? `Related store tax rules:\n${dto.relatedRulesSummary}` : 'No related rules context provided.'}

${dto.existingDraft ? `Existing explanation draft (refine or replace):\n${dto.existingDraft}` : 'No existing explanation draft.'}

Tax category meanings (reference only):
- STANDARD: normal VAT/sales tax rate on taxable goods/services
- REDUCED: lower rate for qualifying goods/services
- ZERO_RATED: 0% rate but may still be reportable / input VAT recoverable
- EXEMPT: outside scope — typically no VAT charged and no input credit

Return exactly this JSON shape:
{
  "ruleTitle": "string (short title from rule name/context)",
  "explanation": "string (3-5 short paragraphs as plain text with line breaks — what this rule is, jurisdiction scope, category meaning, and how finance should interpret it in checkout/AP/AR; no worked numeric examples)",
  "applicabilityNotes": ["string (2-4 bullet-style notes on when this rule applies e.g. country+state match, category selection, system vs custom)"],
  "complianceReminders": ["string (1-3 generic reminders e.g. confirm with local tax advisor, keep audit trail; no invented filing dates)"]
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You write internal tax rule documentation for e-commerce finance teams. Respond with valid JSON only, no extra text. Explain only — never calculate tax or change rules automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/tax-rule-explanation',
      { temperature: 0.35 },
    )

    return this.base.parseJsonResponse<TaxRuleExplanationResultDto>(result.content, {
      ruleTitle: 'Tax rule',
      explanation: result.content,
      applicabilityNotes: [],
      complianceReminders: [],
    })
  }
}
