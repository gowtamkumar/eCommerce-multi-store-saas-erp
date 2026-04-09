import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'
import { FaqRepository } from './faq.repository'
import { FaqEntity } from './entities/faq.entity'
import { CacheService } from '../../operations/infra/cache/cache.service'

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name)
  private readonly CACHE_TTL = 3600 // 1 hour

  constructor(
    private readonly faqRepository: FaqRepository,
    private readonly cache: CacheService,
  ) {}

  private async invalidateCache(tenantId: string) {
    // Invalidate main lookups for this tenant
    await this.cache.delCache('faqs:global', tenantId)
    // Note: In a large system, we would use Redis patterns to delete faqs:page:* 
    // but for now we'll target the main ones or let them expire.
  }

  async createFaq(createFaqDto: CreateFaqDto, tenantId: string): Promise<FaqEntity> {
    this.logger.log(`${this.createFaq.name} Service Called`)
    const result = await this.faqRepository.createAndSave(createFaqDto, tenantId)
    await this.invalidateCache(tenantId)
    return result
  }

  async findAllFaqs(
    filterDto: any,
    tenantId: string,
  ): Promise<{ faqs: FaqEntity[]; total: number }> {
    this.logger.log(`${this.findAllFaqs.name} Service Called`)
    // Admin dashboard fetches are not cached to ensure real-time accuracy
    return await this.faqRepository.findAllWithFilters(filterDto, tenantId)
  }

  async findOneFaq(id: string, tenantId: string): Promise<FaqEntity> {
    this.logger.log(`${this.findOneFaq.name} Service Called`)
    const faq = await this.faqRepository.findById(id, tenantId)
    if (!faq) throw new NotFoundException('FAQ not found')
    return faq
  }

  async updateFaq(id: string, updateFaqDto: UpdateFaqDto, tenantId: string): Promise<FaqEntity> {
    this.logger.log(`${this.updateFaq.name} Service Called`)
    const faq = await this.findOneFaq(id, tenantId)
    const result = await this.faqRepository.updateAndSave(faq, updateFaqDto)
    await this.invalidateCache(tenantId)
    return result
  }

  async removeFaq(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`${this.removeFaq.name} Service Called`)
    const faq = await this.findOneFaq(id, tenantId)
    await this.faqRepository.removeFaq(faq)
    await this.invalidateCache(tenantId)
    return { success: true, message: 'FAQ deleted successfully' }
  }

  // Find FAQs by Page ID
  async findByPageFaq(pageId: string, tenantId: string): Promise<FaqEntity[]> {
    this.logger.log(`${this.findByPageFaq.name} Service Called`)
    const cacheKey = `faqs:page:${pageId}`
    return await this.cache.rememberCache(
      cacheKey,
      () => this.faqRepository.findByPageId(pageId, tenantId),
      this.CACHE_TTL,
      tenantId
    )
  }

  // Find Global FAQs (no productId or pageId)
  async findGlobalFaqs(tenantId: string): Promise<FaqEntity[]> {
    this.logger.log(`${this.findGlobalFaqs.name} Service Called`)
    const cacheKey = 'faqs:global'
    return await this.cache.rememberCache(
      cacheKey,
      () => this.faqRepository.findGlobal(tenantId),
      this.CACHE_TTL,
      tenantId
    )
  }

  // Find FAQs by multiple IDs
  async findByIdsFaq(ids: string[], tenantId: string): Promise<FaqEntity[]> {
    this.logger.log(`${this.findByIdsFaq.name} Service Called`)
    if (!ids || ids.length === 0) return []
    const sortedIds = [...ids].sort().join(',')
    const cacheKey = `faqs:ids:${sortedIds}`
    
    return await this.cache.rememberCache(
      cacheKey,
      () => this.faqRepository.findByIdsList(ids, tenantId),
      this.CACHE_TTL,
      tenantId
    )
  }
}
