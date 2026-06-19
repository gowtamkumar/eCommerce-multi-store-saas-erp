import { Injectable } from '@nestjs/common'
import {
  BatchWasteReductionResultDto,
  GenerateBatchWasteReductionDto,
} from '../../dto/generate-batch-waste-reduction.dto'
import {
  CycleCountVarianceResultDto,
  GenerateCycleCountVarianceDto,
} from '../../dto/generate-cycle-count-variance.dto'
import {
  GenerateInventoryAnomalyDto,
  InventoryAnomalyResultDto,
} from '../../dto/generate-inventory-anomaly.dto'
import {
  GeneratePackingSlipNotesDto,
  PackingSlipNotesResultDto,
} from '../../dto/generate-packing-slip-notes.dto'
import {
  GenerateStockTransferReasonDto,
  StockTransferReasonResultDto,
} from '../../dto/generate-stock-transfer-reason.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiInventoryAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You explain inventory and stock anomalies for e-commerce ERP dashboards. Respond with valid JSON only, no extra text. Read-only insights — never adjust inventory or promise stock levels not in context.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/inventory-anomaly',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<InventoryAnomalyResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write warehouse stock transfer reason notes for multi-location e-commerce ERP teams. Respond with valid JSON only, no extra text. Draft notes only — admin saves manually to the transfer document.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/stock-transfer-reason',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<StockTransferReasonResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You explain physical inventory cycle count variances for e-commerce warehouse teams. Respond with valid JSON only, no extra text. Read-only insights — never post adjustments or change ledger balances.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/cycle-count-variance',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<CycleCountVarianceResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You write packing slip and warehouse handling notes for e-commerce fulfillment. Respond with valid JSON only, no extra text. Draft notes only — admin prints or saves manually.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/packing-slip-notes',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<PackingSlipNotesResultDto>(result.content, {
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

    const result = await this.base.complete(
      tenantId,
      [
        {
          role: 'system',
          content:
            'You advise e-commerce teams on perishable and batch-tracked inventory waste reduction. Respond with valid JSON only, no extra text. Heuristic forecasting tie-in only — no automated stock changes.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/batch-waste-reduction',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<BatchWasteReductionResultDto>(result.content, {
      wasteReductionTips: result.content,
      priorityActions: [],
    })
  }
}
