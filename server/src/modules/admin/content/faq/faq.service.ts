import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'
import { FaqRepository } from './faq.repository'
import { FaqEntity } from './entities/faq.entity'
import { CacheService } from '../../operations/infra/cache/cache.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name)
  private readonly CACHE_TTL = 3600 // 1 hour

  constructor(
    private readonly faqRepository: FaqRepository,
    private readonly cache: CacheService,
  ) {}

  private async invalidateCache(tenantId: string) {
    await this.cache.delCache('faqs:global', tenantId)
    await this.cache.delCache('home', tenantId)
    await this.cache.delCacheByPattern('slug:*', tenantId)
    await this.cache.delCacheByPattern('faqs:page:*', tenantId)
  }

  async createFaq(createFaqDto: CreateFaqDto, ctx: RequestContextDto): Promise<FaqEntity> {
    this.logger.log(`${this.createFaq.name} Service Called`)
    const tenantId = ctx.tenantId
    const result = await this.faqRepository.createAndSave(createFaqDto, ctx)
    await this.invalidateCache(tenantId)
    return result
  }

  async findAllFaqs(
    filterDto: any,
    ctx: RequestContextDto,
  ): Promise<{ faqs: FaqEntity[]; total: number }> {
    this.logger.log(`${this.findAllFaqs.name} Service Called`)
    const tenantId = ctx.tenantId
    // Admin dashboard fetches are not cached to ensure real-time accuracy
    return await this.faqRepository.findAllWithFilters(filterDto, tenantId)
  }

  async findOneFaq(id: string, ctx: RequestContextDto): Promise<FaqEntity> {
    this.logger.log(`${this.findOneFaq.name} Service Called`)
    const tenantId = ctx.tenantId
    const faq = await this.faqRepository.findById(id, tenantId)
    if (!faq) throw new NotFoundException('FAQ not found')
    return faq
  }

  async updateFaq(
    id: string,
    updateFaqDto: UpdateFaqDto,
    ctx: RequestContextDto,
  ): Promise<FaqEntity> {
    this.logger.log(`${this.updateFaq.name} Service Called`)
    const tenantId = ctx.tenantId
    const faq = await this.findOneFaq(id, ctx)
    const result = await this.faqRepository.updateAndSave(faq, updateFaqDto)
    await this.invalidateCache(tenantId)
    return result
  }

  async removeFaq(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`${this.removeFaq.name} Service Called`)
    const tenantId = ctx.tenantId
    const faq = await this.findOneFaq(id, ctx)
    await this.faqRepository.removeFaq(faq)
    await this.invalidateCache(tenantId)
    return { success: true, message: 'FAQ deleted successfully' }
  }

  // Find FAQs by Page ID
  async findByPageFaq(pageId: string, ctx: RequestContextDto): Promise<FaqEntity[]> {
    this.logger.log(`${this.findByPageFaq.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `faqs:page:${pageId}`
    return await this.cache.rememberCache(
      cacheKey,
      () => this.faqRepository.findByPageId(pageId, tenantId),
      this.CACHE_TTL,
      tenantId,
    )
  }

  // Find Global FAQs (no productId or pageId)
  async findGlobalFaqs(ctx: RequestContextDto): Promise<FaqEntity[]> {
    this.logger.log(`${this.findGlobalFaqs.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = 'faqs:global'
    return await this.cache.rememberCache(
      cacheKey,
      () => this.faqRepository.findGlobal(tenantId),
      this.CACHE_TTL,
      tenantId,
    )
  }

  // Find FAQs by multiple IDs
  async findByIdsFaq(ids: string[], ctx: RequestContextDto): Promise<FaqEntity[]> {
    this.logger.log(`${this.findByIdsFaq.name} Service Called`)
    const tenantId = ctx.tenantId
    if (!ids || ids.length === 0) return []
    const sortedIds = [...ids].sort().join(',')
    const cacheKey = `faqs:ids:${sortedIds}`

    return await this.cache.rememberCache(
      cacheKey,
      () => this.faqRepository.findByIdsList(ids, tenantId),
      this.CACHE_TTL,
      tenantId,
    )
  }
}
