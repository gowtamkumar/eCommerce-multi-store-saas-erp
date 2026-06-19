import { CartAbandonedEvent, ProductCreatedEvent } from '@/common/events/ai-domain.events'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { isTenantAiAutomationReady } from '@/common/utils/tenant-ai-automation.util'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { normalizeTenantAiConfig } from '@/modules/system/tenant/utils/tenant-ai.util'
import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { GenerateInvoiceOcrDto } from '../dto/generate-invoice-ocr.dto'
import { AiAssistantService } from './ai-assistant.service'
import { AiJobService } from './ai-job.service'
import { TenantAiClientService } from './tenant-ai-client.service'

const DEMAND_FORECAST_LOOKBACK_DAYS = 60
const DEMAND_FORECAST_TOP_PRODUCTS = 25

@Injectable()
export class AiAutomationService {
  private readonly logger = new Logger(AiAutomationService.name)

  constructor(
    private readonly aiJobService: AiJobService,
    private readonly aiAssistantService: AiAssistantService,
    private readonly tenantAiClient: TenantAiClientService,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async handleProductCreated(event: ProductCreatedEvent): Promise<Record<string, unknown>> {
    if (event.hasSeoFields) {
      return { skipped: true, reason: 'seo_already_set', productId: event.productId }
    }

    const config = await this.tenantAiClient.getConfigForTenant(event.tenantId)
    const normalized = normalizeTenantAiConfig(config)

    if (!isTenantAiAutomationReady(normalized) || !normalized.automation.productSeoOnCreate) {
      return { skipped: true, reason: 'automation_disabled', productId: event.productId }
    }

    const duplicate = await this.aiJobService.hasRecentPayloadJob(
      event.tenantId,
      AiJobType.BULK_SEO,
      'productId',
      event.productId,
      24,
    )
    if (duplicate) {
      return { skipped: true, reason: 'recent_job_exists', productId: event.productId }
    }

    const job = await this.aiJobService.enqueueProductSeoDraft(event.tenantId, event.productId)
    return { enqueued: AiJobType.BULK_SEO, productId: event.productId, jobId: job.id }
  }

  async handleCartAbandoned(event: CartAbandonedEvent): Promise<Record<string, unknown>> {
    const config = await this.tenantAiClient.getConfigForTenant(event.tenantId)
    const normalized = normalizeTenantAiConfig(config)

    if (!isTenantAiAutomationReady(normalized) || !normalized.automation.abandonedCartDraft) {
      return { skipped: true, reason: 'automation_disabled', cartId: event.cartId }
    }

    const duplicate = await this.aiJobService.hasRecentPayloadJob(
      event.tenantId,
      AiJobType.CART_ABANDONED_DRAFT,
      'cartId',
      event.cartId,
      24,
    )
    if (duplicate) {
      return { skipped: true, reason: 'recent_job_exists', cartId: event.cartId }
    }

    const job = await this.aiJobService.enqueueCartAbandonedDraft(event.tenantId, event)
    return { enqueued: AiJobType.CART_ABANDONED_DRAFT, cartId: event.cartId, jobId: job.id }
  }

  async dispatchAutomationEvent(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const eventType = payload.eventType as string

    if (eventType === 'product.created') {
      return this.handleProductCreated({
        tenantId,
        productId: String(payload.productId ?? ''),
        productName: String(payload.productName ?? ''),
        category: payload.category ? String(payload.category) : undefined,
        hasSeoFields: Boolean(payload.hasSeoFields),
      })
    }

    if (eventType === 'cart.abandoned') {
      return this.handleCartAbandoned({
        tenantId,
        cartId: String(payload.cartId ?? ''),
        customerName: String(payload.customerName ?? 'Customer'),
        customerEmail: payload.customerEmail ? String(payload.customerEmail) : undefined,
        customerPhone: payload.customerPhone ? String(payload.customerPhone) : undefined,
        cartSummary: String(payload.cartSummary ?? ''),
        messageTemplate: payload.messageTemplate ? String(payload.messageTemplate) : undefined,
        hoursSinceUpdate:
          typeof payload.hoursSinceUpdate === 'number' ? payload.hoursSinceUpdate : undefined,
      })
    }

    throw new Error(`Unknown automation event type: ${eventType}`)
  }

  async runProductSeoDraftJob(
    tenantId: string,
    productId: string,
  ): Promise<Record<string, unknown>> {
    const product = await this.productRepository.findProductById(productId, tenantId)
    if (!product) {
      return { skipped: true, reason: 'product_not_found', productId }
    }

    const hasSeo = Boolean(product.metaTitle?.trim() || product.metaDescription?.trim())
    if (hasSeo) {
      return { skipped: true, reason: 'seo_already_set', productId }
    }

    const draft = await this.aiAssistantService.generateProductContent(tenantId, {
      productName: product.name,
      category: product.category?.name,
      existingDescription: product.description || product.shortDescription || undefined,
      tone: 'professional',
    })

    return {
      productId,
      productName: product.name,
      draftOnly: true,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      shortDescription: draft.shortDescription,
      tags: draft.tags,
    }
  }

  async runCartAbandonedDraftJob(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const cartId = String(payload.cartId ?? '')
    const draft = await this.aiAssistantService.generateAbandonedCartMessage(tenantId, {
      cartSummary: String(payload.cartSummary ?? ''),
      customerName: String(payload.customerName ?? 'Customer'),
      customerEmail: payload.customerEmail ? String(payload.customerEmail) : undefined,
      customerPhone: payload.customerPhone ? String(payload.customerPhone) : undefined,
      messageTemplate: (payload.messageTemplate as any) || 'gentle_reminder',
      brandName: payload.brandName ? String(payload.brandName) : undefined,
    })

    return {
      cartId,
      draftOnly: true,
      messageTemplate: payload.messageTemplate ?? 'gentle_reminder',
      ...draft,
    }
  }

  async runInvoiceOcrJob(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const dto = payload as unknown as GenerateInvoiceOcrDto
    const result = await this.aiAssistantService.generateInvoiceOcr(tenantId, dto)
    return { draftOnly: true, ...result }
  }

  async runDemandForecastJob(tenantId: string): Promise<Record<string, unknown>> {
    const salesSummary = await this.buildDemandForecastContext(tenantId)
    const forecast = await this.aiAssistantService.generateDemandForecast(tenantId, {
      salesSummary,
      tone: 'practical',
    })

    return {
      draftOnly: true,
      lookbackDays: DEMAND_FORECAST_LOOKBACK_DAYS,
      ...forecast,
    }
  }

  private async buildDemandForecastContext(tenantId: string): Promise<string> {
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - DEMAND_FORECAST_LOOKBACK_DAYS)

    const rows = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.name,
        p.sku,
        COALESCE(p.stock, 0) AS stock,
        COALESCE(SUM(oi.quantity), 0) AS sold_qty
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.tenant_id = p.tenant_id
      LEFT JOIN orders o ON o.id = oi.order_id
        AND o.tenant_id = p.tenant_id
        AND o.created_at >= $2
        AND o.status != $3
      WHERE p.tenant_id = $1
        AND p.deleted_at IS NULL
      GROUP BY p.id, p.name, p.sku, p.stock
      ORDER BY sold_qty DESC, p.stock ASC
      LIMIT $4
      `,
      [tenantId, since, OrderStatus.CANCELLED, DEMAND_FORECAST_TOP_PRODUCTS],
    )

    if (!rows.length) {
      return 'No product sales or stock data available for this tenant in the lookback window.'
    }

    const lines = rows.map(
      (row: { name: string; sku: string; stock: string; sold_qty: string }) =>
        `- ${row.name} (SKU: ${row.sku || 'n/a'}) | stock: ${row.stock} | sold last ${DEMAND_FORECAST_LOOKBACK_DAYS}d: ${row.sold_qty}`,
    )

    return [
      `Tenant demand snapshot (${DEMAND_FORECAST_LOOKBACK_DAYS}-day order history, cancelled excluded):`,
      ...lines,
      '',
      'Provide read-only reorder suggestions. Do not invent SKUs or quantities not listed.',
    ].join('\n')
  }
}
