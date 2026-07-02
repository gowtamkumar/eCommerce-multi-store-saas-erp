import { RequestContextDto } from '@/common/dto/request-context.dto'
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import {
  AskProductQuestionDto,
  ProductQaResultDto,
} from '../dto/ask-product-question.dto'
import { ProductService } from './product.service'
import { StorefrontAiConfigService } from './storefront-ai-config.service'
import { ProductEmbeddingService } from './product-embedding.service'
import { StoreAiClientService } from '@/modules/admin/ai/services/store-ai-client.service'
import {
  buildProductRagContext,
  isProductEligibleForStorefrontQa,
} from '../utils/build-product-rag-context'

@Injectable()
export class ProductQaService {
  private readonly logger = new Logger(ProductQaService.name)

  constructor(
    private readonly productService: ProductService,
    private readonly storeAiClient: StoreAiClientService,
    private readonly storefrontAiConfig: StorefrontAiConfigService,
    private readonly productEmbeddingService: ProductEmbeddingService,
  ) {}

  async isProductQaAvailable(storeId: string): Promise<boolean> {
    const [providerReady, flags] = await Promise.all([
      this.storefrontAiConfig.isProviderReady(storeId),
      this.storefrontAiConfig.getStorefrontFlags(storeId),
    ])
    return providerReady && flags.productQaEnabled
  }

  async askAboutProduct(
    storeId: string,
    slug: string,
    dto: AskProductQuestionDto,
    ctx: RequestContextDto,
  ): Promise<ProductQaResultDto> {
    if (!(await this.isProductQaAvailable(storeId))) {
      throw new ServiceUnavailableException('Product Q&A is not available for this store')
    }

    let product
    try {
      product = await this.productService.findBySlugProduct(slug, ctx)
    } catch {
      throw new NotFoundException('Product not found')
    }

    if (!isProductEligibleForStorefrontQa(product)) {
      throw new ForbiddenException('Product Q&A is only available for active products')
    }

    const ragContext = buildProductRagContext(product)
    const history = (dto.conversationHistory || [])
      .filter((message) => message.content?.trim())
      .slice(-6)

    const prompt = `Answer a shopper question using ONLY the product context below.
If the answer is not supported by the context, say you do not have that information and suggest contacting store support.
Do not invent specifications, warranties, shipping policies, compatibility, or discounts.
Do not change prices or offer promotions. Describe listed price/discount only when asked.
Detect the language of the shopper's question and respond in the same language (e.g. if the shopper asks in Spanish, reply in Spanish, if in German, reply in German).
Keep the answer concise (2-5 sentences), friendly, and shopper-facing plain text (no HTML).

Product context:
${ragContext}

Shopper question:
${dto.question.trim()}

Return exactly this JSON shape:
{
  "answer": "string",
  "suggestedFollowUps": ["string", "string"] 
}`

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content:
          'You are a helpful storefront product assistant. Respond with valid JSON only, no markdown fences. Ground every claim in the provided product context.',
      },
    ]

    for (const message of history) {
      messages.push({
        role: message.role,
        content: message.content.trim(),
      })
    }

    messages.push({ role: 'user', content: prompt })

    try {
      const result = await this.storeAiClient.chatCompletion(storeId, messages, {
        temperature: 0.3,
        maxTokens: 700,
        usageContext: { endpoint: 'products/slug/ask' },
      })

      const parsed = this.parseJsonResponse<ProductQaResultDto>(result.content, {
        answer: result.content.trim(),
        suggestedFollowUps: [],
      })

      void this.productEmbeddingService.recordAssistantEvent(storeId, 'qa', false)

      return parsed
    } catch (error) {
      this.logger.error(`Product Q&A failed for store ${storeId}, slug ${slug}`, error)
      throw error
    }
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
