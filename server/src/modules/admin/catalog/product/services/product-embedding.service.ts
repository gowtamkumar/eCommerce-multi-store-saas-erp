import { ProductStatus } from '@/common/enums/product-status.enum'
import {
  providerSupportsEmbeddings,
  resolveEmbeddingConfigWarning,
} from '@/common/utils/embedding-provider.util'
import { AiJobService } from '@/modules/admin/ai/services/ai-job.service'
import { TenantAiClientService } from '@/modules/admin/ai/services/tenant-ai-client.service'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash } from 'crypto'
import { In, Repository } from 'typeorm'
import { FilterProductDto } from '../dto/filter-product.dto'
import { ProductEmbeddingEntity } from '../entities/product-embedding.entity'
import { ProductEntity } from '../entities/product.entity'
import {
  StorefrontSearchEventEntity,
  StorefrontSearchMode,
} from '../entities/storefront-search-event.entity'
import { StorefrontAssistantEventEntity } from '../entities/storefront-assistant-event.entity'
import { ProductRepository } from '../repositories/product.repository'
import { StorefrontAiConfigService } from './storefront-ai-config.service'
import { cosineSimilarity, mergeHybridProductIds } from '../utils/semantic-search.util'

const EMBEDDING_BATCH_SIZE = 20
const HYBRID_CANDIDATE_LIMIT = 200

@Injectable()
export class ProductEmbeddingService {
  private readonly logger = new Logger(ProductEmbeddingService.name)

  constructor(
    @InjectRepository(ProductEmbeddingEntity)
    private readonly embeddingRepo: Repository<ProductEmbeddingEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(StorefrontSearchEventEntity)
    private readonly searchEventRepo: Repository<StorefrontSearchEventEntity>,
    @InjectRepository(StorefrontAssistantEventEntity)
    private readonly assistantEventRepo: Repository<StorefrontAssistantEventEntity>,
    private readonly productRepository: ProductRepository,
    private readonly tenantAiClient: TenantAiClientService,
    private readonly storefrontAiConfig: StorefrontAiConfigService,
    private readonly aiJobService: AiJobService,
  ) {}

  async hasSemanticSearchIndex(tenantId: string): Promise<boolean> {
    const count = await this.embeddingRepo.count({ where: { tenantId } })
    return count > 0
  }

  async canUseHybridSearch(tenantId: string): Promise<boolean> {
    const [providerReady, flags, hasIndex] = await Promise.all([
      this.storefrontAiConfig.isProviderReady(tenantId),
      this.storefrontAiConfig.getStorefrontFlags(tenantId),
      this.hasSemanticSearchIndex(tenantId),
    ])

    if (!providerReady || !flags.semanticSearchEnabled || !hasIndex) {
      return false
    }

    try {
      const config = await this.tenantAiClient.getConfigForTenant(tenantId)
      return Boolean(config.embeddingModel?.trim())
    } catch {
      return false
    }
  }

  async getIndexStatus(tenantId: string): Promise<{
    indexedCount: number
    activeProductCount: number
    hybridSearchReady: boolean
    embeddingModel?: string
    embeddingsSupported: boolean
    embeddingWarning: string | null
    searchAnalytics: {
      days: number
      keywordSearches: number
      hybridSearches: number
    }
    assistantAnalytics: {
      days: number
      chatCount: number
      qaCount: number
      handoffCount: number
    }
  }> {
    const [
      indexedCount,
      activeProductCount,
      hybridSearchReady,
      config,
      flags,
      searchAnalytics,
      assistantAnalytics,
    ] = await Promise.all([
      this.embeddingRepo.count({ where: { tenantId } }),
      this.productRepo.count({ where: { tenantId, status: ProductStatus.ACTIVE } }),
      this.canUseHybridSearch(tenantId),
      this.tenantAiClient.getConfigForTenant(tenantId),
      this.storefrontAiConfig.getStorefrontFlags(tenantId),
      this.getSearchAnalytics(tenantId, 30),
      this.getAssistantAnalytics(tenantId, 30),
    ])

    const embeddingsSupported = providerSupportsEmbeddings(config.provider)
    const embeddingWarning = resolveEmbeddingConfigWarning({
      enabled: config.enabled,
      provider: config.provider,
      embeddingModel: config.embeddingModel,
      semanticSearchEnabled: flags.semanticSearchEnabled,
    })

    return {
      indexedCount,
      activeProductCount,
      hybridSearchReady,
      embeddingModel: config.embeddingModel,
      embeddingsSupported,
      embeddingWarning,
      searchAnalytics,
      assistantAnalytics,
    }
  }

  async canAutoSyncEmbeddings(tenantId: string): Promise<boolean> {
    try {
      const [providerReady, flags, config] = await Promise.all([
        this.storefrontAiConfig.isProviderReady(tenantId),
        this.storefrontAiConfig.getStorefrontFlags(tenantId),
        this.tenantAiClient.getConfigForTenant(tenantId),
      ])

      return (
        providerReady &&
        flags.semanticSearchEnabled &&
        providerSupportsEmbeddings(config.provider) &&
        Boolean(config.embeddingModel?.trim())
      )
    } catch {
      return false
    }
  }

  async scheduleProductEmbeddingSync(tenantId: string, productId: string): Promise<void> {
    if (!(await this.canAutoSyncEmbeddings(tenantId))) {
      return
    }

    try {
      await this.aiJobService.enqueueEmbeddingBatch(tenantId, [productId])
    } catch (error) {
      this.logger.warn(`Failed to queue embedding sync for product ${productId}`, error)
    }
  }

  async enqueueCatalogReindex(tenantId: string) {
    return this.aiJobService.enqueueEmbeddingReindex(tenantId)
  }

  async syncProductEmbeddings(
    tenantId: string,
    productIds: string[],
  ): Promise<{ indexed: number; skipped: number; failed: number; removed: number }> {
    const uniqueIds = [...new Set(productIds.filter(Boolean))]
    if (uniqueIds.length === 0) {
      return { indexed: 0, skipped: 0, failed: 0, removed: 0 }
    }

    const config = await this.tenantAiClient.getConfigForTenant(tenantId)
    if (!config.enabled || !config.apiKey?.trim() || !config.embeddingModel?.trim()) {
      throw new ServiceUnavailableException('AI embeddings are not configured for this store')
    }

    if (!providerSupportsEmbeddings(config.provider)) {
      throw new ServiceUnavailableException('Embeddings are not supported for this AI provider')
    }

    const products = await this.productRepo.find({
      where: { tenantId, id: In(uniqueIds) },
      relations: { category: true, brand: true, attributes: true },
    })

    const foundIds = new Set(products.map((product) => product.id))
    const missingIds = uniqueIds.filter((id) => !foundIds.has(id))

    let indexed = 0
    let skipped = 0
    let failed = 0
    let removed = 0

    if (missingIds.length > 0) {
      await this.removeEmbeddingsForProducts(tenantId, missingIds)
      removed += missingIds.length
    }

    const pending: Array<{ product: ProductEntity; content: string; contentHash: string }> = []

    for (const product of products) {
      if (product.status !== ProductStatus.ACTIVE) {
        await this.removeEmbeddingsForProducts(tenantId, [product.id])
        removed += 1
        continue
      }

      const content = this.buildSearchDocument(product)
      const contentHash = createHash('sha256').update(content).digest('hex')
      const existing = await this.embeddingRepo.findOne({
        where: { tenantId, productId: product.id },
      })

      if (
        existing &&
        existing.contentHash === contentHash &&
        existing.embeddingModel === config.embeddingModel
      ) {
        skipped += 1
        continue
      }

      pending.push({ product, content, contentHash })
    }

    if (pending.length > 0) {
      const batchResult = await this.upsertEmbeddingBatch(tenantId, pending, config.embeddingModel!)
      indexed += batchResult.indexed
      failed += batchResult.failed
    }

    return { indexed, skipped, failed, removed }
  }

  async recordSearchEvent(
    tenantId: string,
    mode: StorefrontSearchMode,
    resultCount: number,
  ): Promise<void> {
    try {
      await this.searchEventRepo.insert({
        tenantId,
        mode,
        resultCount: Math.max(0, resultCount),
      })
    } catch (error) {
      this.logger.warn(`Failed to record storefront search event for tenant ${tenantId}`, error)
    }
  }

  async getSearchAnalytics(tenantId: string, days = 30): Promise<{
    days: number
    keywordSearches: number
    hybridSearches: number
  }> {
    const safeDays = Math.min(Math.max(days, 1), 90)
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - safeDays)
    since.setUTCHours(0, 0, 0, 0)

    const rows = await this.searchEventRepo
      .createQueryBuilder('event')
      .select('event.mode', 'mode')
      .addSelect('COUNT(*)', 'count')
      .where('event.tenant_id = :tenantId', { tenantId })
      .andWhere('event.created_at >= :since', { since })
      .groupBy('event.mode')
      .getRawMany<{ mode: StorefrontSearchMode; count: string }>()

    let keywordSearches = 0
    let hybridSearches = 0

    for (const row of rows) {
      const count = Number(row.count) || 0
      if (row.mode === 'hybrid') {
        hybridSearches = count
      } else if (row.mode === 'keyword') {
        keywordSearches = count
      }
    }

    return { days: safeDays, keywordSearches, hybridSearches }
  }

  async recordAssistantEvent(
    tenantId: string,
    type: 'chat' | 'qa',
    liveChatHandoff: boolean,
  ): Promise<void> {
    try {
      await this.assistantEventRepo.insert({
        tenantId,
        type,
        liveChatHandoff,
      })
    } catch (error) {
      this.logger.warn(`Failed to record storefront assistant event for tenant ${tenantId}`, error)
    }
  }

  async getAssistantAnalytics(
    tenantId: string,
    days = 30,
  ): Promise<{
    days: number
    chatCount: number
    qaCount: number
    handoffCount: number
  }> {
    const safeDays = Math.min(Math.max(days, 1), 90)
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - safeDays)
    since.setUTCHours(0, 0, 0, 0)

    const rows = await this.assistantEventRepo
      .createQueryBuilder('event')
      .select('event.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect(
        'SUM(CASE WHEN event.live_chat_handoff = true THEN 1 ELSE 0 END)',
        'handoff_count',
      )
      .where('event.tenant_id = :tenantId', { tenantId })
      .andWhere('event.created_at >= :since', { since })
      .groupBy('event.type')
      .getRawMany<{ type: string; count: string; handoff_count: string }>()

    let chatCount = 0
    let qaCount = 0
    let handoffCount = 0

    for (const row of rows) {
      const count = Number(row.count) || 0
      const handoffs = Number(row.handoff_count) || 0
      handoffCount += handoffs
      if (row.type === 'chat') {
        chatCount = count
      } else if (row.type === 'qa') {
        qaCount = count
      }
    }

    return { days: safeDays, chatCount, qaCount, handoffCount }
  }

  buildSearchDocument(product: ProductEntity): string {
    const attributeText = (product.attributes || [])
      .map((attribute) => `${attribute.name}: ${(attribute.values || []).join(', ')}`)
      .join('\n')

    const parts = [
      product.name,
      product.shortDescription,
      product.description?.slice(0, 2000),
      product.sku,
      product.category?.name,
      product.brand?.name,
      product.metaTitle,
      product.metaDescription,
      attributeText,
    ].filter(Boolean)

    return parts.join('\n').slice(0, 8000)
  }

  async reindexTenantCatalog(tenantId: string): Promise<{
    indexed: number
    skipped: number
    failed: number
  }> {
    const config = await this.tenantAiClient.getConfigForTenant(tenantId)
    if (!config.enabled || !config.apiKey?.trim() || !config.embeddingModel?.trim()) {
      throw new ServiceUnavailableException('AI embeddings are not configured for this store')
    }

    const products = await this.productRepo.find({
      where: { tenantId, status: ProductStatus.ACTIVE },
      relations: { category: true, brand: true, attributes: true },
      order: { createdAt: 'ASC' },
    })

    let indexed = 0
    let skipped = 0
    let failed = 0

    for (let offset = 0; offset < products.length; offset += EMBEDDING_BATCH_SIZE) {
      const batch = products.slice(offset, offset + EMBEDDING_BATCH_SIZE)
      const pending: Array<{ product: ProductEntity; content: string; contentHash: string }> = []

      for (const product of batch) {
        const content = this.buildSearchDocument(product)
        const contentHash = createHash('sha256').update(content).digest('hex')
        const existing = await this.embeddingRepo.findOne({
          where: { tenantId, productId: product.id },
        })

        if (
          existing &&
          existing.contentHash === contentHash &&
          existing.embeddingModel === config.embeddingModel
        ) {
          skipped += 1
          continue
        }

        pending.push({ product, content, contentHash })
      }

      if (pending.length === 0) {
        continue
      }

      const batchResult = await this.upsertEmbeddingBatch(tenantId, pending, config.embeddingModel!)
      indexed += batchResult.indexed
      failed += batchResult.failed
    }

    return { indexed, skipped, failed }
  }

  private async upsertEmbeddingBatch(
    tenantId: string,
    pending: Array<{ product: ProductEntity; content: string; contentHash: string }>,
    embeddingModel: string,
  ): Promise<{ indexed: number; failed: number }> {
    let indexed = 0
    let failed = 0

    try {
      const result = await this.tenantAiClient.createEmbeddings(
        tenantId,
        pending.map((item) => item.content),
        { usageContext: { endpoint: 'embeddings/sync' } },
      )

      for (let i = 0; i < pending.length; i += 1) {
        const item = pending[i]
        const embedding = result.embeddings[i]
        if (!embedding?.length) {
          failed += 1
          continue
        }

        await this.embeddingRepo.upsert(
          {
            tenantId,
            productId: item.product.id,
            contentHash: item.contentHash,
            embeddingModel: result.model || embeddingModel,
            embedding,
          },
          ['tenantId', 'productId'],
        )
        indexed += 1
      }
    } catch (error) {
      this.logger.error(`Failed embedding batch for tenant ${tenantId}`, error)
      failed += pending.length
    }

    return { indexed, failed }
  }

  async searchProductIds(
    tenantId: string,
    query: string,
    limit: number,
    filterDto: FilterProductDto = {},
  ): Promise<string[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return []
    }

    const queryEmbedding = await this.tenantAiClient.createEmbeddings(tenantId, [trimmedQuery], {
      usageContext: { endpoint: 'embeddings/query' },
    })
    const vector = queryEmbedding.embeddings[0]
    if (!vector?.length) {
      return []
    }

    const qb = this.embeddingRepo
      .createQueryBuilder('embedding')
      .innerJoin(
        'products',
        'product',
        'product.id = embedding.product_id AND product.tenant_id = embedding.tenant_id',
      )
      .where('embedding.tenant_id = :tenantId', { tenantId })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .select(['embedding.productId', 'embedding.embedding'])

    if (filterDto.categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId: filterDto.categoryId })
    }
    if (filterDto.brandId) {
      qb.andWhere('product.brand_id = :brandId', { brandId: filterDto.brandId })
    }

    const rows = await qb.getMany()
    const ranked = rows
      .map((row) => ({
        productId: row.productId,
        score: cosineSimilarity(vector, row.embedding),
      }))
      .filter((row) => row.score >= 0.65)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return ranked.map((row) => row.productId)
  }

  async hybridSearchProductIds(
    tenantId: string,
    filterDto: FilterProductDto,
    candidateLimit = HYBRID_CANDIDATE_LIMIT,
  ): Promise<string[]> {
    const query = filterDto.q?.trim()
    if (!query) {
      return []
    }

    const keywordFilter = {
      ...filterDto,
      page: 1,
      limit: candidateLimit,
    }

    const [keywordResults, semanticIds] = await Promise.all([
      this.productRepository.findAllWithFilters(keywordFilter, tenantId),
      this.searchProductIds(tenantId, query, candidateLimit, filterDto),
    ])

    return mergeHybridProductIds(
      keywordResults[0].map((product) => product.id),
      semanticIds,
      candidateLimit,
    )
  }

  async removeEmbeddingsForProducts(tenantId: string, productIds: string[]): Promise<void> {
    if (productIds.length === 0) {
      return
    }

    await this.embeddingRepo.delete({
      tenantId,
      productId: In(productIds),
    })
  }
}
