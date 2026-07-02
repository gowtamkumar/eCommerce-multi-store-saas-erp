import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { FaqStatus } from '@/common/enums/faq-status.enum'
import { CategoryRepository } from '@/modules/admin/catalog/category/category.repository'
import { StoreAiClientService } from '@/modules/admin/ai/services/store-ai-client.service'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ProductEntity } from '../entities/product.entity'
import {
  StorefrontAiStatusDto,
  StorefrontAssistantChatDto,
  StorefrontAssistantChatResultDto,
} from '../dto/ask-product-question.dto'
import { ProductRepository } from '../repositories/product.repository'
import { ProductEmbeddingService } from './product-embedding.service'
import { StorefrontAiConfigService } from './storefront-ai-config.service'
import { buildStorefrontAssistantContext } from '../utils/build-storefront-assistant-context'

@Injectable()
export class StorefrontAssistantService {
  private readonly logger = new Logger(StorefrontAssistantService.name)

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly faqRepository: FaqRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly storeAiClient: StoreAiClientService,
    private readonly storefrontAiConfig: StorefrontAiConfigService,
    private readonly productEmbeddingService: ProductEmbeddingService,
  ) {}

  async getStatus(storeId: string): Promise<StorefrontAiStatusDto> {
    const [providerReady, flags, semanticIndexed] = await Promise.all([
      this.storefrontAiConfig.isProviderReady(storeId),
      this.storefrontAiConfig.getStorefrontFlags(storeId),
      this.productEmbeddingService.hasSemanticSearchIndex(storeId),
    ])

    return {
      shoppingAssistantEnabled: flags.shoppingAssistantEnabled,
      productQaEnabled: flags.productQaEnabled,
      semanticSearchEnabled: flags.semanticSearchEnabled,
      shoppingAssistantAvailable:
        providerReady && flags.shoppingAssistantEnabled,
      productQaAvailable: providerReady && flags.productQaEnabled,
      semanticSearchAvailable:
        providerReady && flags.semanticSearchEnabled && semanticIndexed,
    }
  }

  async isShoppingAssistantAvailable(storeId: string): Promise<boolean> {
    const status = await this.getStatus(storeId)
    return status.shoppingAssistantAvailable
  }

  async chat(
    storeId: string,
    dto: StorefrontAssistantChatDto,
    _ctx: RequestContextDto,
  ): Promise<StorefrontAssistantChatResultDto> {
    if (!(await this.isShoppingAssistantAvailable(storeId))) {
      throw new ServiceUnavailableException('Shopping assistant is not available for this store')
    }

    const message = dto.message.trim()
    const ragContext = await this.buildRagContext(storeId, message, dto.brandName)
    const history = (dto.conversationHistory || [])
      .filter((entry) => entry.content?.trim())
      .slice(-8)

    const prompt = `You are a storefront shopping assistant. Answer the shopper using ONLY the store catalog and FAQ context below.

Rules:
- Recommend products only from the catalog list; include them in productLinks with exact slug values from context.
- Do not invent products, prices, discounts, shipping policies, or return policies.
- You cannot add items to cart, checkout, change prices, or access orders/accounts.
- For order tracking, payment issues, returns, account access, or complaints, set suggestLiveChatHandoff to true and briefly mention they can tap "Talk to a human" for live support.
- Detect the language of the shopper's message and respond in the same language (e.g. if the shopper asks in Spanish, reply in Spanish, if in German, reply in German).
- Keep answers concise (2-6 sentences), friendly, plain text (no HTML).

Store context:
${ragContext}

Shopper message:
${message}

Return exactly this JSON shape:
{
  "answer": "string",
  "suggestedFollowUps": ["string", "string"],
  "productLinks": [{ "name": "string", "slug": "string" }],
  "suggestLiveChatHandoff": false
}`

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content:
          'You are a helpful shopping assistant for an e-commerce storefront. Respond with valid JSON only, no markdown fences.',
      },
    ]

    for (const entry of history) {
      messages.push({
        role: entry.role,
        content: entry.content.trim(),
      })
    }

    messages.push({ role: 'user', content: prompt })

    try {
      const result = await this.storeAiClient.chatCompletion(storeId, messages, {
        temperature: 0.35,
        maxTokens: 900,
        usageContext: { endpoint: 'products/storefront-ai/chat' },
      })

      const parsed = this.parseJsonResponse<StorefrontAssistantChatResultDto>(result.content, {
        answer: result.content.trim(),
        suggestedFollowUps: [],
        productLinks: [],
        suggestLiveChatHandoff: false,
      })

      const suggestLiveChatHandoff = !!parsed.suggestLiveChatHandoff
      void this.productEmbeddingService.recordAssistantEvent(storeId, 'chat', suggestLiveChatHandoff)

      return {
        answer: parsed.answer,
        suggestedFollowUps: (parsed.suggestedFollowUps || []).slice(0, 3),
        productLinks: (parsed.productLinks || [])
          .filter((link) => link?.name && link?.slug)
          .slice(0, 4),
        suggestLiveChatHandoff,
      }
    } catch (error) {
      this.logger.error(`Shopping assistant chat failed for store ${storeId}`, error)
      throw error
    }
  }

  private async buildRagContext(
    storeId: string,
    message: string,
    brandName?: string,
  ): Promise<string> {
    let matchedProducts: ProductEntity[] = []
    const canUseHybrid = await this.productEmbeddingService.canUseHybridSearch(storeId)

    if (canUseHybrid) {
      try {
        const matchedIds = await this.productEmbeddingService.hybridSearchProductIds(
          storeId,
          { q: message, status: ProductStatus.ACTIVE },
          12,
        )
        if (matchedIds.length > 0) {
          matchedProducts = await this.productRepository.findByIdsWithFilters(
            matchedIds,
            { status: ProductStatus.ACTIVE },
            storeId,
          )
        }
      } catch (error) {
        this.logger.warn(`Hybrid search retrieval failed for storefront assistant RAG context`, error)
      }
    }

    if (matchedProducts.length === 0) {
      const [keywordProducts] = await this.productRepository.findAllWithFilters(
        { page: 1, limit: 12, q: message, status: ProductStatus.ACTIVE },
        storeId,
      )
      matchedProducts = keywordProducts
    }

    const [categories, globalFaqs, matchedFaqsResult, catalogProductsResult] =
      await Promise.all([
        this.categoryRepository.findAllByStore(storeId),
        this.faqRepository.findGlobal(storeId),
        this.faqRepository.findAllWithFilters(
          { page: 1, limit: 10, q: message, status: FaqStatus.ACTIVE },
          storeId,
        ),
        this.productRepository.findAllWithFilters(
          { page: 1, limit: 24, status: ProductStatus.ACTIVE, sort: 'newest' },
          storeId,
        ),
      ])

    return buildStorefrontAssistantContext({
      categories,
      globalFaqs: globalFaqs.slice(0, 20),
      matchedFaqs: matchedFaqsResult.faqs,
      matchedProducts,
      catalogProducts: catalogProductsResult[0],
      brandName,
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
