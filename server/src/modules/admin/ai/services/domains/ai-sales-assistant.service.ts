import { Injectable } from '@nestjs/common'
import { GenerateOrderAssistDto, OrderAssistResultDto } from '../../dto/generate-order-assist.dto'
import { GenerateReturnAssistDto, ReturnAssistResultDto } from '../../dto/generate-return-assist.dto'
import { GeneratePosCashierAssistDto, PosCashierAssistResultDto } from '../../dto/generate-pos-cashier-assist.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiSalesAssistantService {
  constructor(
    private readonly base: AiAssistantBaseService,
  ) {}

  async generateOrderAssist(
    storeId: string,
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

      const result = await this.base.complete(
        storeId,
        [
          {
            role: 'system',
            content:
              'You help e-commerce operations staff understand order statuses. Respond with valid JSON only, no extra text. Never invent tracking numbers or amounts not in the context.',
          },
          { role: 'user', content: prompt },
        ],
        'ai/generate/order-assist',
        { temperature: 0.4 },
      )

      return this.base.parseJsonResponse<OrderAssistResultDto>(result.content, { explanation: '' })
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

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You draft customer order emails for online stores. Respond with valid JSON only, no extra text. Never promise refunds or changes not stated in the order context.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/order-assist',
      { temperature: 0.55 },
    )

    return this.base.parseJsonResponse<OrderAssistResultDto>(result.content, {
      emailSubject: `Update on your order`,
      emailBody: result.content,
    })
  }

  async generateReturnAssist(
    storeId: string,
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

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You draft return and refund explanation letters for e-commerce stores. Respond with valid JSON only, no extra text. Never promise refund amounts, timelines, or policy exceptions not stated in the context.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/return-assist',
      { temperature: 0.55 },
    )

    return this.base.parseJsonResponse<ReturnAssistResultDto>(result.content, {
      emailSubject: 'Update on your return request',
      emailBody: result.content,
    })
  }

  async generatePosCashierAssist(
    storeId: string,
    dto: GeneratePosCashierAssistDto,
  ): Promise<PosCashierAssistResultDto> {
    if (dto.context === 'upsell') {
      const prompt = `You are an expert retail sales assistant helping a cashier cross-sell/upsell to a customer.
Cart Items:
${dto.cartSummary || 'Empty'}

Customer Context:
${dto.customerSummary || 'None'}

Generate up to 3 cross-sell or upsell product suggestions with short, persuasive 1-2 sentence pitches the cashier can say directly to the customer.
Return exactly this JSON shape:
{
  "upsellSuggestions": [
    {
      "productSuggest": "Name of suggested product",
      "pitchExplanation": "The exact script/pitch the cashier can say to the customer"
    }
  ]
}`

      const result = await this.base.complete(
        storeId,
        [
          {
            role: 'system',
            content:
              'You help POS cashiers upsell products to customers. Respond with valid JSON only, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
        'ai/generate/pos-cashier-assist',
        { temperature: 0.5 },
      )

      return this.base.parseJsonResponse<PosCashierAssistResultDto>(result.content, {
        upsellSuggestions: [],
      })
    }

    if (dto.context === 'reconciliation') {
      const prompt = `You are a retail operations auditor helping a cashier reconcile the till cash register.
Shift Metrics:
${dto.shiftSummary || 'None'}

Provide 3-5 clear, bulleted audit steps or troubleshooting checklist items to help find drawer discrepancies or ensure correct shift closing.
Return exactly this JSON shape:
{
  "reconciliationSteps": [
    "Step 1...",
    "Step 2..."
  ]
}`

      const result = await this.base.complete(
        storeId,
        [
          {
            role: 'system',
            content:
              'You help cashiers audit and reconcile physical cash drawer variances. Respond with valid JSON only, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
        'ai/generate/pos-cashier-assist',
        { temperature: 0.4 },
      )

      return this.base.parseJsonResponse<PosCashierAssistResultDto>(result.content, {
        reconciliationSteps: [],
      })
    }

    const prompt = `You are a professional retail manager drafting transaction remarks/notes for audit compliance.
Transaction/Shift Context:
${dto.transactionSummary || 'None'}

Draft a concise, professional remark (1-2 sentences) explaining the purpose of this drawer adjustment or shift variance to keep the ledger clear and compliant.
Return exactly this JSON shape:
{
  "suggestedRemarks": "The drafted remark text"
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You draft audit-compliant transaction remarks for POS registers. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/pos-cashier-assist',
      { temperature: 0.5 },
    )

    return this.base.parseJsonResponse<PosCashierAssistResultDto>(result.content, {
      suggestedRemarks: '',
    })
  }
}
