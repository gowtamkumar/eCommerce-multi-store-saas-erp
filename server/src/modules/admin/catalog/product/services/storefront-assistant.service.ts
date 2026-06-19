import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { FaqStatus } from '@/common/enums/faq-status.enum'
import { CategoryRepository } from '@/modules/admin/catalog/category/category.repository'
import { TenantAiClientService } from '@/modules/admin/ai/services/tenant-ai-client.service'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
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
    private readonly tenantAiClient: TenantAiClientService,
    private readonly storefrontAiConfig: StorefrontAiConfigService,
    private readonly productEmbeddingService: ProductEmbeddingService,
  ) {}

  async getStatus(tenantId: string): Promise<StorefrontAiStatusDto> {
    const [providerReady, flags, semanticIndexed] = await Promise.all([
      this.storefrontAiConfig.isProviderReady(tenantId),
      this.storefrontAiConfig.getStorefrontFlags(tenantId),
      this.productEmbeddingService.hasSemanticSearchIndex(tenantId),
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

  async isShoppingAssistantAvailable(tenantId: string): Promise<boolean> {
    const status = await this.getStatus(tenantId)
    return status.shoppingAssistantAvailable
  }

  async chat(
    tenantId: string,
    dto: StorefrontAssistantChatDto,
    _ctx: RequestContextDto,
  ): Promise<StorefrontAssistantChatResultDto> {
    if (!(await this.isShoppingAssistantAvailable(tenantId))) {
      throw new ServiceUnavailableException('Shopping assistant is not available for this store')
    }

    const message = dto.message.trim()
    const ragContext = await this.buildRagContext(tenantId, message, dto.brandName)
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
      const result = await this.tenantAiClient.chatCompletion(tenantId, messages, {
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
      void this.productEmbeddingService.recordAssistantEvent(tenantId, 'chat', suggestLiveChatHandoff)

      return {
        answer: parsed.answer,
        suggestedFollowUps: (parsed.suggestedFollowUps || []).slice(0, 3),
        productLinks: (parsed.productLinks || [])
          .filter((link) => link?.name && link?.slug)
          .slice(0, 4),
        suggestLiveChatHandoff,
      }
    } catch (error) {
      this.logger.error(`Shopping assistant chat failed for tenant ${tenantId}`, error)
      throw error
    }
  }

  private async buildRagContext(
    tenantId: string,
    message: string,
    brandName?: string,
  ): Promise<string> {
    const [categories, globalFaqs, matchedFaqsResult, matchedProductsResult, catalogProductsResult] =
      await Promise.all([
        this.categoryRepository.findAllByTenant(tenantId),
        this.faqRepository.findGlobal(tenantId),
        this.faqRepository.findAllWithFilters(
          { page: 1, limit: 10, q: message, status: FaqStatus.ACTIVE },
          tenantId,
        ),
        this.productRepository.findAllWithFilters(
          { page: 1, limit: 12, q: message, status: ProductStatus.ACTIVE },
          tenantId,
        ),
        this.productRepository.findAllWithFilters(
          { page: 1, limit: 24, status: ProductStatus.ACTIVE, sort: 'newest' },
          tenantId,
        ),
      ])

    return buildStorefrontAssistantContext({
      categories,
      globalFaqs: globalFaqs.slice(0, 20),
      matchedFaqs: matchedFaqsResult.faqs,
      matchedProducts: matchedProductsResult[0],
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
