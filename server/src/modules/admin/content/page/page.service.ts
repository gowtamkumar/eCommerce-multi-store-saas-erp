import { ProductService } from '@/modules/admin/catalog/product/product.service'
import { FaqService } from '@/modules/admin/content/faq/faq.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageEntity } from './entities/page.entity'
import { PageRepository } from './page.repository'

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name)

  constructor(
    private readonly pageRepository: PageRepository,
    private readonly productService: ProductService,
    private readonly faqService: FaqService,
  ) {}

  async createPage(dto: CreatePageDto, tenantId: string): Promise<PageEntity> {
    this.logger.log(`${this.createPage.name} Service Called`)
    const existing = await this.pageRepository.findBySlug(dto.slug, tenantId)
    if (existing) throw new ConflictException('Slug already exists for this tenant')

    if (dto.isHomePage) {
      await this.pageRepository.unsetHomePage(tenantId)
    }

    return await this.pageRepository.createAndSave(dto, tenantId)
  }

  async findAllPages(tenantId: string, status?: string): Promise<PageEntity[]> {
    this.logger.log(`${this.findAllPages.name} Service Called`)
    return await this.pageRepository.findAllWithStatus(tenantId, status)
  }

  async findOnePage(id: string, tenantId: string): Promise<PageEntity> {
    this.logger.log(`${this.findOnePage.name} Service Called`)
    const page = await this.pageRepository.findById(id, tenantId)
    if (!page) throw new NotFoundException('Page not found')
    return page
  }

  async findBySlugPage(slug: string, tenantId: string): Promise<PageEntity> {
    this.logger.log(`${this.findBySlugPage.name} Service Called`)
    const page = await this.pageRepository.findBySlug(slug, tenantId)
    if (!page) throw new NotFoundException('Page not found')
    return JSON.parse(JSON.stringify(page))
  }

  async findHomePage(tenantId: string): Promise<PageEntity | null> {
    this.logger.log(`${this.findHomePage.name} Service Called`)
    return await this.pageRepository.findHomePage(tenantId)
  }

  async updatePage(id: string, dto: UpdatePageDto, tenantId: string): Promise<PageEntity> {
    this.logger.log(`${this.updatePage.name} Service Called`)
    const page = await this.findOnePage(id, tenantId)

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.pageRepository.findBySlug(dto.slug, tenantId)
      if (existing) throw new ConflictException('Slug already exists for this tenant')
    }

    if (dto.isHomePage && !page.isHomePage) {
      await this.pageRepository.unsetHomePage(tenantId)
    }

    return await this.pageRepository.updateAndSave(page, dto)
  }

  async removePage(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`${this.removePage.name} Service Called`)
    const page = await this.findOnePage(id, tenantId)
    await this.pageRepository.removePage(page)
    return { success: true, message: 'Page deleted successfully' }
  }

  async findAllPagesCrossTenant(): Promise<PageEntity[]> {
    this.logger.log(`${this.findAllPagesCrossTenant.name} Service Called`)
    return await this.pageRepository.findAllCrossTenant()
  }

  // Load FAQs for a page with faq-section
  async enrichPageWithFaqs(page: PageEntity): Promise<PageEntity> {
    this.logger.log(`${this.enrichPageWithFaqs.name} Service Called`)
    if (!page.sections || page.sections.length === 0) return page

    const enrichedSections = await Promise.all(
      page.sections.map(async (section) => {
        if (section.type === 'faq-section' as any) {
          const source = section.settings?.source || 'page'

          let faqs = []
          if (source === 'page') {
            faqs = await this.faqService.findByPageFaq(page.id, page.tenantId)
          } else if (source === 'global') {
            faqs = await this.faqService.findGlobalFaqs(page.tenantId)
          } else if (source === 'specific' && section.settings?.faqIds) {
            faqs = await this.faqService.findByIdsFaq(section.settings.faqIds, page.tenantId)
          }

          return { ...section, data: { faqs } }
        }
        return section
      }),
    )

    return { ...page, sections: enrichedSections } as PageEntity
  }

  async countByTenant(tenantId: string): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.pageRepository.countByTenant(tenantId)
  }
}
