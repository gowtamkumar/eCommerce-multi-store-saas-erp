import { Injectable } from '@nestjs/common'
import {
  GenerateApplicantScreeningDto,
  ApplicantScreeningResultDto,
  ScreeningQuestionDto,
} from '../../dto/generate-applicant-screening.dto'
import {
  GenerateLeaveFaqDto,
  LeaveFaqResultDto,
  LeaveFaqItemDto,
} from '../../dto/generate-leave-faq.dto'
import {
  GeneratePayslipExplanationDto,
  PayslipExplanationResultDto,
} from '../../dto/generate-payslip-explanation.dto'
import {
  GeneratePerformanceReviewPhrasesDto,
  PerformanceReviewPhrasesResultDto,
} from '../../dto/generate-performance-review-phrases.dto'
import {
  GenerateRecruitmentJobCopyDto,
  RecruitmentJobCopyResultDto,
} from '../../dto/generate-recruitment-job-copy.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiHrmAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

  async generateRecruitmentJobCopy(
    tenantId: string,
    dto: GenerateRecruitmentJobCopyDto,
  ): Promise<RecruitmentJobCopyResultDto> {
    const prompt = `Write recruitment HR copy for a job posting as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, inclusive, and clear — suitable for e-commerce / retail / operations hiring'}

Job context:
${dto.jobSummary}

${dto.existingDraft ? `Existing draft (refine or replace):\n${dto.existingDraft}` : 'No existing draft.'}

Return exactly this JSON shape:
{
  "jobDescription": "string (3-5 short paragraphs as plain text with line breaks — role overview, responsibilities, team context, and what success looks like; align with provided title/department/location/salary only)",
  "requirements": ["string (5-8 bullet-style must-have requirements, one per item — skills, experience, tools)"],
  "screeningQuestions": ["string (4-6 interview screening questions HR can ask applicants — behavioral and role-specific, one per item)"]
}

Draft only — HR reviews before publishing. Do not invent benefits or compensation not in context.`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write job descriptions and HR screening questions for e-commerce and retail teams. Respond with valid JSON only, no extra text. Draft copy only — never publish jobs or contact candidates automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/recruitment-job-copy',
      { temperature: 0.5 },
    )

    const parsed = this.base.parseJsonResponse<RecruitmentJobCopyResultDto>(result.content, {
      jobDescription: result.content,
      requirements: [],
      screeningQuestions: [],
    })

    return {
      jobDescription: parsed.jobDescription?.trim() || '',
      requirements: Array.isArray(parsed.requirements)
        ? parsed.requirements.map((item) => String(item).trim()).filter(Boolean)
        : [],
      screeningQuestions: Array.isArray(parsed.screeningQuestions)
        ? parsed.screeningQuestions.map((item) => String(item).trim()).filter(Boolean)
        : [],
    }
  }

  async generatePerformanceReviewPhrases(
    tenantId: string,
    dto: GeneratePerformanceReviewPhrasesDto,
  ): Promise<PerformanceReviewPhrasesResultDto> {
    const focusGuide =
      dto.focus === 'strengths'
        ? 'Emphasize strengthsPhrases and summaryPhrases; keep developmentPhrases brief.'
        : dto.focus === 'development'
          ? 'Emphasize developmentPhrases and constructive summaryPhrases; keep strengthsPhrases brief.'
          : 'Balance strengths and development phrases equally.'

    const prompt = `Generate a performance review phrase bank for HR managers as JSON only (no markdown fences).

CRITICAL PRIVACY RULES:
- Context intentionally excludes employee names, emails, IDs, and other direct identifiers — do NOT invent or reference personal names.
- Write generic, reusable manager-facing phrases suitable for the role/department/score/KPI context only.
- Professional, respectful, and constructive — suitable for formal HR records.
- Draft only — manager selects/edits phrases manually before submitting a review.

Focus: ${dto.focus || 'balanced'}
${focusGuide}

Review context (minimized — no PII):
${dto.reviewSummary}

${dto.existingDraft ? `Existing manager comment draft (refine tone only, do not add PII):\n${dto.existingDraft}` : 'No existing comment draft.'}

Return exactly this JSON shape:
{
  "strengthsPhrases": ["string (4-6 short bullet-style positive observation phrases, one line each)"],
  "developmentPhrases": ["string (3-5 constructive growth-area phrases, one line each — specific but not harsh)"],
  "summaryPhrases": ["string (2-3 short closing summary sentences manager can adapt)"],
  "usageNotes": ["string (1-2 reminders e.g. personalize before sharing, avoid copying verbatim without context)"]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write performance review phrase banks for HR managers in e-commerce and retail. Respond with valid JSON only, no extra text. Never include employee names or identifying details. Draft phrases only — never submit reviews automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/performance-review-phrases',
      { temperature: 0.45 },
    )

    const parsed = this.base.parseJsonResponse<PerformanceReviewPhrasesResultDto>(result.content, {
      strengthsPhrases: [],
      developmentPhrases: [],
      summaryPhrases: [result.content],
      usageNotes: [],
    })

    const normalize = (items: unknown) =>
      Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []

    return {
      strengthsPhrases: normalize(parsed.strengthsPhrases),
      developmentPhrases: normalize(parsed.developmentPhrases),
      summaryPhrases: normalize(parsed.summaryPhrases),
      usageNotes: normalize(parsed.usageNotes),
    }
  }

  async generatePayslipExplanation(
    tenantId: string,
    dto: GeneratePayslipExplanationDto,
  ): Promise<PayslipExplanationResultDto> {
    const prompt = `Write an employee-facing payslip explanation message as JSON only (no markdown fences).

CRITICAL RULES:
- Template fill only — explain ONLY payslip amounts and line items provided in context.
- Do NOT invent earnings, deductions, tax rates, or dates not in the payslip context.
- Use a friendly, professional tone suitable for email or portal message to the employee.
- Reference specific figures from context when explaining basic pay, allowances, deductions, and net pay.
- Do not include bank account numbers, national IDs, or other sensitive identifiers.
- Draft only — HR sends manually; never disburse pay or modify payroll automatically.

Payslip context (from payroll system):
${dto.payslipSummary}

${dto.existingDraft ? `Existing draft (refine or replace):\n${dto.existingDraft}` : 'No existing draft.'}

Return exactly this JSON shape:
{
  "emailSubject": "string (max 80 chars — e.g. Your [period] payslip summary)",
  "employeeMessage": "string (3-5 short paragraphs as plain text with line breaks — employee-facing explanation of how net pay was calculated, referencing context figures)",
  "breakdownBullets": ["string (4-8 bullet-style lines mapping major earnings/deduction components to amounts from context)"],
  "internalNotes": ["string (1-2 HR-only reminders e.g. verify figures before sending, employee may reply with questions)"]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write employee payslip explanation messages for HR/payroll teams. Respond with valid JSON only, no extra text. Use only figures supplied in context. Draft only — never change payroll or send email automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/payslip-explanation',
      { temperature: 0.35 },
    )

    const parsed = this.base.parseJsonResponse<PayslipExplanationResultDto>(result.content, {
      emailSubject: 'Your payslip summary',
      employeeMessage: result.content,
      breakdownBullets: [],
      internalNotes: [],
    })

    const normalize = (items: unknown) =>
      Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []

    return {
      emailSubject: parsed.emailSubject?.trim() || 'Your payslip summary',
      employeeMessage: parsed.employeeMessage?.trim() || '',
      breakdownBullets: normalize(parsed.breakdownBullets),
      internalNotes: normalize(parsed.internalNotes),
    }
  }

  async generateLeaveFaq(tenantId: string, dto: GenerateLeaveFaqDto): Promise<LeaveFaqResultDto> {
    const seedQsBlock = dto.seedQuestions?.length
      ? `\nSeed questions to definitely include:\n${dto.seedQuestions.map((q) => `- ${q}`).join('\n')}`
      : ''

    const prompt = `Generate an employee-facing leave policy FAQ as JSON only (no markdown fences).

COMPLIANCE RULES:
- Base all answers STRICTLY on the policy text provided. Do NOT invent leave entitlements, dates, or legal rights not mentioned.
- If the policy is silent on a question, write "Please check with HR" as the answer instead of guessing.
- Use plain, friendly language suitable for ${dto.audience || 'all employees'}.
- Draft only — HR must review before publishing.

${dto.companyName ? `Company: ${dto.companyName}` : ''}
Target audience: ${dto.audience || 'all employees'}

Leave policy text:
${dto.policySummary}
${seedQsBlock}

Return exactly this JSON shape:
{
  "title": "string (e.g. \\"${dto.companyName ? dto.companyName + ' ' : ''}Leave Policy – Frequently Asked Questions\\")",
  "intro": "string (1 short paragraph introducing the FAQ, optional)",
  "faqs": [
    {
      "question": "string (the question)",
      "answer": "string (plain-text answer based only on policy; reference specific figures where possible)"
    }
  ],
  "reviewNotes": ["string (1-3 HR reviewer reminders before publishing)"]
}

Generate 8-12 FAQ items covering the most common questions employees ask about this policy.`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You generate employee-facing leave policy FAQs for HR teams. Respond with valid JSON only, no extra text. Answers must be grounded solely in the provided policy — never invent entitlements. Draft only — HR publishes after review.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/leave-faq',
      { temperature: 0.3 },
    )

    type RawFaqResult = { title?: string; intro?: string; faqs?: unknown[]; reviewNotes?: unknown[] }
    const parsed = this.base.parseJsonResponse<RawFaqResult>(result.content, {
      title: 'Leave Policy FAQ',
      faqs: [],
      reviewNotes: [],
    })

    const normalize = (items: unknown) =>
      Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []

    const parseFaqs = (items: unknown): LeaveFaqItemDto[] => {
      if (!Array.isArray(items)) return []
      return items
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            const r = item as Record<string, unknown>
            return { question: String(r['question'] ?? '').trim(), answer: String(r['answer'] ?? '').trim() }
          }
          return null
        })
        .filter((x): x is LeaveFaqItemDto => x !== null && !!x.question)
    }

    return {
      title: parsed.title?.trim() || 'Leave Policy FAQ',
      intro: parsed.intro?.trim(),
      faqs: parseFaqs(parsed.faqs),
      reviewNotes: normalize(parsed.reviewNotes),
    }
  }

  async generateApplicantScreening(
    tenantId: string,
    dto: GenerateApplicantScreeningDto,
  ): Promise<ApplicantScreeningResultDto> {
    const count = dto.count ?? 8
    const stage = dto.stage ?? 'initial'
    const focusBlock = dto.focusAreas?.length
      ? `\nPrioritise these competencies/areas:\n${dto.focusAreas.map((f) => `- ${f}`).join('\n')}`
      : ''

    const stageGuide: Record<string, string> = {
      initial: 'broad motivation, communication, and baseline skills questions suitable for a first phone screen',
      technical: 'deep technical / problem-solving questions; include one or two situational coding or architecture scenarios',
      cultural_fit: 'values alignment, collaboration style, and team-dynamic questions',
      final: 'strategic thinking, leadership potential, and role-specific scenario questions for a panel interview',
    }

    const prompt = `Generate interview screening questions for HR / hiring managers as JSON only (no markdown fences).

COMPLIANCE RULES:
- Do NOT include questions about age, gender, ethnicity, nationality, religion, marital status, pregnancy, disability, or any other legally protected characteristic.
- Questions should be open-ended, role-relevant, and assessable.
- Style: ${dto.tone || 'behavioral (STAR method)'}
- Stage: ${stage} — focus on ${stageGuide[stage] || stageGuide['initial']}
- Count: generate exactly ${count} questions.
${focusBlock}

Job context (no candidate PII):
${dto.jobSummary}

Return exactly this JSON shape:
{
  "questions": [
    {
      "question": "string (the interview question)",
      "category": "string (e.g. Technical, Behavioral, Culture Fit, Role-Specific)",
      "interviewerGuide": "string (1-2 sentences on what a strong answer includes — optional but recommended)"
    }
  ],
  "suggestedDurationMinutes": number,
  "complianceNotes": ["string (2-3 legal / DEI reminders for interviewers)"]
}

Do not include candidate names, contact details, or any PII. Draft only — hiring manager reviews before use.`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You generate interview screening question banks for HR and hiring managers. Respond with valid JSON only. Never ask about protected characteristics. Questions should be behavioural, open-ended, and role-relevant. Draft only — never contact candidates automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/applicant-screening',
      { temperature: 0.4 },
    )

    type RawScreeningResult = {
      questions?: unknown[]
      suggestedDurationMinutes?: unknown
      complianceNotes?: unknown[]
    }
    const parsed = this.base.parseJsonResponse<RawScreeningResult>(result.content, {
      questions: [],
      suggestedDurationMinutes: 30,
      complianceNotes: [],
    })

    const normalize = (items: unknown) =>
      Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []

    const parseQuestions = (items: unknown): ScreeningQuestionDto[] => {
      if (!Array.isArray(items)) return []
      return items
        .map((item): ScreeningQuestionDto | null => {
          if (typeof item === 'object' && item !== null) {
            const r = item as Record<string, unknown>
            const q = String(r['question'] ?? '').trim()
            if (!q) return null
            const result: ScreeningQuestionDto = {
              question: q,
              category: String(r['category'] ?? 'General').trim(),
            }
            if (r['interviewerGuide']) {
              result.interviewerGuide = String(r['interviewerGuide']).trim()
            }
            return result
          }
          return null
        })
        .filter((x): x is ScreeningQuestionDto => x !== null)
    }

    const durationRaw = parsed.suggestedDurationMinutes
    const duration =
      typeof durationRaw === 'number' && durationRaw > 0
        ? Math.round(durationRaw)
        : stage === 'final' ? 60 : stage === 'technical' ? 90 : 30

    return {
      questions: parseQuestions(parsed.questions),
      suggestedDurationMinutes: duration,
      complianceNotes: normalize(parsed.complianceNotes),
    }
  }
}
