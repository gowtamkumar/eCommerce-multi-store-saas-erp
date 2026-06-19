import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { TenantAiClientService } from '@/modules/admin/ai/services/tenant-ai-client.service'
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
  StorefrontAiStatusDto,
} from '../dto/ask-product-question.dto'
import { ProductService } from './product.service'
import {
  buildProductRagContext,
  isProductEligibleForStorefrontQa,
} from '../utils/build-product-rag-context'

@Injectable()
export class ProductQaService {
  private readonly logger = new Logger(ProductQaService.name)

  constructor(
    private readonly productService: ProductService,
    private readonly tenantAiClient: TenantAiClientService,
    private readonly permissionResolution: PermissionResolutionService,
  ) {}

  async getStorefrontStatus(tenantId: string): Promise<StorefrontAiStatusDto> {
    return {
      productQaAvailable: await this.isProductQaAvailable(tenantId),
    }
  }

  async isProductQaAvailable(tenantId: string): Promise<boolean> {
    if (!(await this.permissionResolution.isFeatureEnabledForTenant(tenantId, 'ai'))) {
      return false
    }

    try {
      const config = await this.tenantAiClient.getConfigForTenant(tenantId)
      return Boolean(config.enabled && config.apiKey?.trim() && config.defaultModel?.trim())
    } catch {
      return false
    }
  }

  async askAboutProduct(
    tenantId: string,
    slug: string,
    dto: AskProductQuestionDto,
    ctx: RequestContextDto,
  ): Promise<ProductQaResultDto> {
    if (!(await this.isProductQaAvailable(tenantId))) {
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
      const result = await this.tenantAiClient.chatCompletion(tenantId, messages, {
        temperature: 0.3,
        maxTokens: 700,
      })

      return this.parseJsonResponse<ProductQaResultDto>(result.content, {
        answer: result.content.trim(),
        suggestedFollowUps: [],
      })
    } catch (error) {
      this.logger.error(`Product Q&A failed for tenant ${tenantId}, slug ${slug}`, error)
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
