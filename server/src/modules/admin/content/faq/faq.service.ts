import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'
import { FaqRepository } from './faq.repository'

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name)

  constructor(private readonly faqRepository: FaqRepository) {}

  async createFaq(createFaqDto: CreateFaqDto, tenantId: string) {
    this.logger.log(`${this.createFaq.name} Service Called`)
    return await this.faqRepository.createAndSave(createFaqDto, tenantId)
  }

  async findAllFaqs(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllFaqs.name} Service Called`)
    return await this.faqRepository.findAllWithFilters(filterDto, tenantId)
  }

  async findOneFaq(id: string, tenantId: string) {
    this.logger.log(`${this.findOneFaq.name} Service Called`)
    const faq = await this.faqRepository.findById(id, tenantId)
    if (!faq) throw new NotFoundException('FAQ not found')
    return faq
  }

  async updateFaq(id: string, updateFaqDto: UpdateFaqDto, tenantId: string) {
    this.logger.log(`${this.updateFaq.name} Service Called`)
    const faq = await this.findOneFaq(id, tenantId)
    return await this.faqRepository.updateAndSave(faq, updateFaqDto)
  }

  async removeFaq(id: string, tenantId: string) {
    this.logger.log(`${this.removeFaq.name} Service Called`)
    const faq = await this.findOneFaq(id, tenantId)
    await this.faqRepository.removeFaq(faq)
    return { success: true }
  }

  // Find FAQs by Page ID
  async findByPageFaq(pageId: string, tenantId: string) {
    this.logger.log(`${this.findByPageFaq.name} Service Called`)
    return await this.faqRepository.findByPageId(pageId, tenantId)
  }

  // Find Global FAQs (no productId or pageId)
  async findGlobalFaqs(tenantId: string) {
    this.logger.log(`${this.findGlobalFaqs.name} Service Called`)
    return await this.faqRepository.findGlobal(tenantId)
  }

  // Find FAQs by multiple IDs
  async findByIdsFaq(ids: string[], tenantId: string) {
    this.logger.log(`${this.findByIdsFaq.name} Service Called`)
    return await this.faqRepository.findByIdsList(ids, tenantId)
  }
}
