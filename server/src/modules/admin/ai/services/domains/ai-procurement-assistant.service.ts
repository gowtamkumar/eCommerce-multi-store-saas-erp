import { Injectable } from '@nestjs/common'
import {
  DebitNoteDisputeResultDto,
  GenerateDebitNoteDisputeDto,
} from '../../dto/generate-debit-note-dispute.dto'
import {
  GenerateGrnDiscrepancyNotesDto,
  GrnDiscrepancyNotesResultDto,
} from '../../dto/generate-grn-discrepancy-notes.dto'
import { GenerateInvoiceOcrDto, InvoiceOcrResultDto } from '../../dto/generate-invoice-ocr.dto'
import {
  GeneratePoCoverLetterDto,
  PoCoverLetterResultDto,
} from '../../dto/generate-po-cover-letter.dto'
import {
  GenerateRequisitionJustificationDto,
  RequisitionJustificationResultDto,
} from '../../dto/generate-requisition-justification.dto'
import {
  GenerateSupplierProfileSummaryDto,
  SupplierProfileSummaryResultDto,
} from '../../dto/generate-supplier-profile-summary.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiProcurementAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

  async generateRequisitionJustification(
    tenantId: string,
    dto: GenerateRequisitionJustificationDto,
  ): Promise<RequisitionJustificationResultDto> {
    const prompt = `Draft purchase requisition justification and line notes for a procurement team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, concise, and approval-friendly'}

Requisition context:
${dto.requisitionSummary}

${dto.existingJustification ? `Existing justification (refine or replace):\n${dto.existingJustification}` : 'No existing justification.'}

Return exactly this JSON shape:
{
  "justificationText": "string (2-4 sentences suitable for the PR header — business need, urgency tied to required date, and stock/replenishment rationale; do not invent products or quantities not in context)",
  "lineNotes": ["string (one spec/note per line item in the same order as listed in context — short procurement spec e.g. grade, packaging, preferred supplier hint; empty string if none needed)"]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write purchase requisition justifications and line-item specs for e-commerce SCM teams. Respond with valid JSON only, no extra text. Draft only — approver submits manually.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/requisition-justification',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<RequisitionJustificationResultDto>(result.content, {
      justificationText: result.content,
      lineNotes: [],
    })
  }

  async generatePoCoverLetter(
    tenantId: string,
    dto: GeneratePoCoverLetterDto,
  ): Promise<PoCoverLetterResultDto> {
    const prompt = `Draft a purchase order cover letter for a supplier as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, courteous, and procurement-standard'}

Purchase order context:
${dto.purchaseOrderSummary}

${dto.existingCoverLetter ? `Existing cover letter draft (refine or replace):\n${dto.existingCoverLetter}` : 'No existing cover letter.'}

Return exactly this JSON shape:
{
  "coverLetter": "string (3-5 short paragraphs as plain text with line breaks — formal PO cover letter to supplier referencing PO number, line summary, expected delivery, and request for confirmation; do not invent SKUs, prices, or dates not in context)",
  "termsNotes": "string (2-4 bullet points as plain text with line breaks — internal delivery/payment terms reminders for procurement e.g. net-30, FOB, inspection on receipt; internal only)"
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write B2B purchase order cover letters for e-commerce procurement teams. Respond with valid JSON only, no extra text. Draft only — buyer sends manually.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/po-cover-letter',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<PoCoverLetterResultDto>(result.content, {
      coverLetter: result.content,
      termsNotes: '',
    })
  }

  async generateGrnDiscrepancyNotes(
    tenantId: string,
    dto: GenerateGrnDiscrepancyNotesDto,
  ): Promise<GrnDiscrepancyNotesResultDto> {
    const prompt = `Draft goods receipt (GRN) discrepancy notes for a procurement and warehouse team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: factual, audit-friendly, and concise'}

GRN receipt context:
${dto.grnSummary}

Ordered vs received discrepancies:
${dto.discrepancySummary}

${dto.existingNotes ? `Existing internal notes (incorporate or refine):\n${dto.existingNotes}` : 'No existing notes provided.'}

Return exactly this JSON shape:
{
  "discrepancyNotes": "string (3-5 short paragraphs as plain text with line breaks — internal receipt audit narrative explaining what was short, over, or matched; likely causes e.g. partial shipment, damaged units, packing slip mismatch; recommended next steps e.g. hold invoice line, supplier claim, recount; do not invent quantities or SKUs not in context; never recommend automatic stock or ledger adjustments)",
  "lineHighlights": ["string (3-8 bullet-style one-liners flagging specific line discrepancies e.g. SKU short by 5 units, over-receipt on variant X, full match on remaining lines)"],
  "supplierFollowUp": "string (2-4 short paragraphs as plain text with line breaks — draft supplier-facing follow-up message requesting clarification or credit memo for discrepancies; professional B2B tone; reference PO/GRN from context only)"
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You document goods receipt discrepancies for e-commerce procurement teams. Respond with valid JSON only, no extra text. Draft-only notes — buyer posts or sends manually.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/grn-discrepancy-notes',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<GrnDiscrepancyNotesResultDto>(result.content, {
      discrepancyNotes: result.content,
      lineHighlights: [],
      supplierFollowUp: '',
    })
  }

  async generateInvoiceOcr(
    tenantId: string,
    dto: GenerateInvoiceOcrDto,
  ): Promise<InvoiceOcrResultDto> {
    const isImage = dto.mimetype?.startsWith('image/') ?? false
    const useVision = Boolean(dto.useVision && dto.imageUrl && isImage)

    const prompt = `Extract supplier invoice fields from the provided document as JSON only (no markdown fences).
${useVision ? 'Analyze the attached invoice image carefully for all visible line items and amounts.' : 'No vision image — extract only from pasted invoice text below.'}

Invoice file metadata:
${dto.invoiceSummary}

${dto.invoiceText ? `Pasted invoice text:\n${dto.invoiceText}` : 'No pasted invoice text provided.'}

${dto.poContextSummary ? `Related purchase order context (for cross-check hints only — do not override visible invoice values):\n${dto.poContextSummary}` : 'No PO context provided.'}

Return exactly this JSON shape:
{
  "invoiceNumber": "string or null (supplier invoice number as printed)",
  "supplierName": "string or null (vendor/supplier name on invoice)",
  "invoiceDate": "string or null (ISO date YYYY-MM-DD if parseable)",
  "dueDate": "string or null (ISO date YYYY-MM-DD if parseable)",
  "currency": "string or null (e.g. USD)",
  "subtotal": "number or null",
  "taxAmount": "number or null",
  "totalAmount": "number or null",
  "lineItems": [
    {
      "description": "string (product or service line description as printed)",
      "quantity": "number",
      "unitPrice": "number",
      "lineTotal": "number or null",
      "sku": "string or null (SKU/part number if visible)"
    }
  ],
  "extractionNotes": "string (brief notes on confidence, illegible fields, or assumptions — internal only)",
  "visionUsed": ${useVision ? 'true' : 'false'},
  "unmatchedWarnings": ["string (0-5 warnings e.g. missing due date, ambiguous quantity, totals do not sum)"]
}

Rules: Extract only what is visible or clearly stated. Use null for unknown fields. lineItems may be empty if unreadable. Do not invent SKUs or prices.`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You extract structured data from supplier invoices for accounts payable teams. Respond with valid JSON only, no extra text. Draft extraction only — humans approve before posting.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/invoice-ocr',
      {
        temperature: 0.2,
        imageUrl: useVision ? dto.imageUrl : undefined,
      },
    )

    return this.base.parseJsonResponse<InvoiceOcrResultDto>(result.content, {
      lineItems: [],
      extractionNotes: result.content,
      visionUsed: useVision,
      unmatchedWarnings: [],
    })
  }

  async generateDebitNoteDispute(
    tenantId: string,
    dto: GenerateDebitNoteDisputeDto,
  ): Promise<DebitNoteDisputeResultDto> {
    const prompt = `Draft a supplier debit note dispute letter for a procurement and accounts payable team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional, firm, and factual — B2B procurement standard'}

Debit note context:
${dto.debitNoteSummary}

${dto.existingDisputeLetter ? `Existing dispute letter draft (refine or replace):\n${dto.existingDisputeLetter}` : 'No existing dispute letter draft.'}

Return exactly this JSON shape:
{
  "disputeLetter": "string (3-5 short paragraphs as plain text with line breaks — formal supplier-facing letter disputing charges or requesting credit; reference debit note number, PO, amount, and reason from context; request acknowledgment and AP adjustment; do not invent invoice numbers, SKUs, or amounts not in context)",
  "internalNotes": "string (2-4 bullet points as plain text with line breaks — internal AP reminders e.g. attach GRN photos, hold payment on disputed line, escalate if no response in 7 days; internal only)"
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write B2B supplier debit note dispute letters for e-commerce procurement teams. Respond with valid JSON only, no extra text. Draft only — buyer sends manually; never post ledger entries automatically.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/debit-note-dispute',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<DebitNoteDisputeResultDto>(result.content, {
      disputeLetter: result.content,
      internalNotes: '',
    })
  }

  async generateSupplierProfileSummary(
    tenantId: string,
    dto: GenerateSupplierProfileSummaryDto,
  ): Promise<SupplierProfileSummaryResultDto> {
    const prompt = `Summarize this supplier profile for a procurement and vendor management team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: factual, concise, and procurement-focused'}

Supplier profile:
${dto.supplierSummary}

${dto.existingSummary ? `Existing summary draft (refine or replace):\n${dto.existingSummary}` : 'No existing summary draft.'}

Return exactly this JSON shape:
{
  "profileSummary": "string (3-5 short paragraphs as plain text with line breaks — internal read-only briefing: who they are, category/fit, lead time and rating signals, contact reachability, AP balance implications, and recommended procurement posture e.g. preferred vendor, monitor quality, negotiate terms; do not invent contracts, SKUs, or performance metrics not in context)",
  "supplierTags": ["string (3-6 short tags, e.g. Active vendor, Long lead time, High AP balance, Top rated — each max 4 words)"]
}`

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You produce read-only supplier profile summaries for e-commerce procurement teams. Respond with valid JSON only, no extra text. Insights only — never change supplier records or recommend automated ledger actions.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/supplier-profile-summary',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<SupplierProfileSummaryResultDto>(result.content, {
      profileSummary: result.content,
      supplierTags: [],
    })
  }
}
