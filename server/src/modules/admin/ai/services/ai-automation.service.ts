import { CartAbandonedEvent, ProductCreatedEvent } from '@/common/events/ai-domain.events'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { isStoreAiAutomationReady } from '@/common/utils/store-ai-automation.util'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { normalizeStoreAiConfig } from '@/modules/system/store/utils/store-ai.util'
import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { GenerateInvoiceOcrDto } from '../dto/generate-invoice-ocr.dto'
import { AiCatalogAssistantService } from './domains/ai-catalog-assistant.service'
import { AiCrmAssistantService } from './domains/ai-crm-assistant.service'
import { AiProcurementAssistantService } from './domains/ai-procurement-assistant.service'
import { AiJobService } from './ai-job.service'
import { StoreAiClientService } from './store-ai-client.service'
import { ProductEmbeddingService } from '@/modules/admin/catalog/product/services/product-embedding.service'

const DEMAND_FORECAST_LOOKBACK_DAYS = 60
const DEMAND_FORECAST_TOP_PRODUCTS = 25

@Injectable()
export class AiAutomationService {
  private readonly logger = new Logger(AiAutomationService.name)

  constructor(
    private readonly aiJobService: AiJobService,
    private readonly catalogAssistant: AiCatalogAssistantService,
    private readonly crmAssistant: AiCrmAssistantService,
    private readonly procurementAssistant: AiProcurementAssistantService,
    private readonly storeAiClient: StoreAiClientService,
    private readonly productRepository: ProductRepository,
    private readonly productEmbeddingService: ProductEmbeddingService,
    private readonly dataSource: DataSource,
  ) {}

  async handleProductCreated(event: ProductCreatedEvent): Promise<Record<string, unknown>> {
    if (event.hasSeoFields) {
      return { skipped: true, reason: 'seo_already_set', productId: event.productId }
    }

    const config = await this.storeAiClient.getConfigForStore(event.storeId)
    const normalized = normalizeStoreAiConfig(config)

    if (!isStoreAiAutomationReady(normalized) || !normalized.automation.productSeoOnCreate) {
      return { skipped: true, reason: 'automation_disabled', productId: event.productId }
    }

    const duplicate = await this.aiJobService.hasRecentPayloadJob(
      event.storeId,
      AiJobType.BULK_SEO,
      'productId',
      event.productId,
      24,
    )
    if (duplicate) {
      return { skipped: true, reason: 'recent_job_exists', productId: event.productId }
    }

    const job = await this.aiJobService.enqueueProductSeoDraft(event.storeId, event.productId)
    return { enqueued: AiJobType.BULK_SEO, productId: event.productId, jobId: job.id }
  }

  async handleCartAbandoned(event: CartAbandonedEvent): Promise<Record<string, unknown>> {
    const config = await this.storeAiClient.getConfigForStore(event.storeId)
    const normalized = normalizeStoreAiConfig(config)

    if (!isStoreAiAutomationReady(normalized) || !normalized.automation.abandonedCartDraft) {
      return { skipped: true, reason: 'automation_disabled', cartId: event.cartId }
    }

    const duplicate = await this.aiJobService.hasRecentCartAbandonedAutomation(
      event.storeId,
      event.cartId,
      24,
    )
    if (duplicate) {
      return { skipped: true, reason: 'recent_job_exists', cartId: event.cartId }
    }

    const job = await this.aiJobService.enqueueCartAbandonedDraft(event.storeId, event)
    return { enqueued: AiJobType.CART_ABANDONED_DRAFT, cartId: event.cartId, jobId: job.id }
  }

  async dispatchAutomationEvent(
    storeId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const eventType = payload.eventType as string

    if (eventType === 'product.created') {
      return this.handleProductCreated({
        storeId,
        productId: String(payload.productId ?? ''),
        productName: String(payload.productName ?? ''),
        category: payload.category ? String(payload.category) : undefined,
        hasSeoFields: Boolean(payload.hasSeoFields),
      })
    }

    if (eventType === 'cart.abandoned') {
      return this.handleCartAbandoned({
        storeId,
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
    storeId: string,
    productId: string,
  ): Promise<Record<string, unknown>> {
    const product = await this.productRepository.findProductById(productId, storeId)
    if (!product) {
      return { skipped: true, reason: 'product_not_found', productId }
    }

    const hasSeo = Boolean(product.metaTitle?.trim() || product.metaDescription?.trim())
    if (hasSeo) {
      return { skipped: true, reason: 'seo_already_set', productId }
    }

    const draft = await this.catalogAssistant.generateProductContent(storeId, {
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

  async runBulkDescriptionImportJob(
    storeId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const productIds = Array.isArray(payload.productIds)
      ? (payload.productIds as string[]).filter(Boolean)
      : []
    const applyToProducts = payload.applyToProducts !== false
    const importBatchId = String(payload.importBatchId ?? '')

    const results: Array<Record<string, unknown>> = []
    let generatedCount = 0
    let skippedCount = 0
    let failedCount = 0

    for (const productId of productIds) {
      try {
        const outcome = await this.generateAndApplyImportedDescription(
          storeId,
          productId,
          applyToProducts,
        )
        results.push(outcome)
        if (outcome.skipped) {
          skippedCount += 1
        } else if (outcome.failed) {
          failedCount += 1
        } else {
          generatedCount += 1
        }
      } catch (error: unknown) {
        failedCount += 1
        const message = error instanceof Error ? error.message : 'generation_failed'
        results.push({ productId, failed: true, reason: message })
      }
    }

    return {
      importBatchId,
      draftOnly: !applyToProducts,
      processedCount: productIds.length,
      generatedCount,
      skippedCount,
      failedCount,
      results,
    }
  }

  private async generateAndApplyImportedDescription(
    storeId: string,
    productId: string,
    applyToProducts: boolean,
  ): Promise<Record<string, unknown>> {
    const product = await this.productRepository.findProductById(productId, storeId)
    if (!product) {
      return { productId, skipped: true, reason: 'product_not_found' }
    }

    const needsDescription = this.productNeedsImportedDescription(product)
    if (!needsDescription) {
      return { productId, productName: product.name, skipped: true, reason: 'has_description' }
    }

    const draft = await this.catalogAssistant.generateProductContent(storeId, {
      productName: product.name,
      category: product.category?.name,
      keywords: undefined,
      existingDescription: product.description || undefined,
      tone: 'professional',
    })

    if (applyToProducts) {
      await this.productRepository.updateAndSave(product, {
        description: draft.description || product.description,
        shortDescription: draft.shortDescription || product.shortDescription,
        metaTitle: product.metaTitle?.trim() ? product.metaTitle : draft.seoTitle,
        metaDescription: product.metaDescription?.trim()
          ? product.metaDescription
          : draft.seoDescription,
      })
      void this.productEmbeddingService.scheduleProductEmbeddingSync(storeId, productId)
    }

    return {
      productId,
      productName: product.name,
      applied: applyToProducts,
      description: draft.description,
      shortDescription: draft.shortDescription,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      tags: draft.tags,
    }
  }

  private productNeedsImportedDescription(product: {
    description?: string | null
    shortDescription?: string | null
  }): boolean {
    const description = product.description?.trim() ?? ''
    const shortDescription = product.shortDescription?.trim() ?? ''
    const placeholder = '(imported — description pending)'

    if (!description || description === placeholder) {
      return true
    }

    if (!shortDescription && description.length < 40) {
      return true
    }

    const lowered = description.toLowerCase()
    return lowered === 'tbd' || lowered === 'n/a'
  }

  async runCartAbandonedDraftJob(
    storeId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const cartId = String(payload.cartId ?? '')
    const draft = await this.crmAssistant.generateAbandonedCartMessage(storeId, {
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
    storeId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const dto = payload as unknown as GenerateInvoiceOcrDto
    const result = await this.procurementAssistant.generateInvoiceOcr(storeId, dto)
    return { draftOnly: true, ...result }
  }

  async runDemandForecastJob(storeId: string): Promise<Record<string, unknown>> {
    const salesSummary = await this.buildDemandForecastContext(storeId)
    const forecast = await this.catalogAssistant.generateDemandForecast(storeId, {
      salesSummary,
      tone: 'practical',
    })

    return {
      draftOnly: true,
      lookbackDays: DEMAND_FORECAST_LOOKBACK_DAYS,
      ...forecast,
    }
  }

  private async buildDemandForecastContext(storeId: string): Promise<string> {
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
      LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.store_id = p.store_id
      LEFT JOIN orders o ON o.id = oi.order_id
        AND o.store_id = p.store_id
        AND o.created_at >= $2
        AND o.status != $3
      WHERE p.store_id = $1
        AND p.deleted_at IS NULL
      GROUP BY p.id, p.name, p.sku, p.stock
      ORDER BY sold_qty DESC, p.stock ASC
      LIMIT $4
      `,
      [storeId, since, OrderStatus.CANCELLED, DEMAND_FORECAST_TOP_PRODUCTS],
    )

    if (!rows.length) {
      return 'No product sales or stock data available for this store in the lookback window.'
    }

    const lines = rows.map(
      (row: { name: string; sku: string; stock: string; sold_qty: string }) =>
        `- ${row.name} (SKU: ${row.sku || 'n/a'}) | stock: ${row.stock} | sold last ${DEMAND_FORECAST_LOOKBACK_DAYS}d: ${row.sold_qty}`,
    )

    return [
      `Store demand snapshot (${DEMAND_FORECAST_LOOKBACK_DAYS}-day order history, cancelled excluded):`,
      ...lines,
      '',
      'Provide read-only reorder suggestions. Do not invent SKUs or quantities not listed.',
    ].join('\n')
  }
}
