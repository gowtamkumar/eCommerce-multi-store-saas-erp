import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FaqService } from '@/modules/admin/content/faq/faq.service'
import { ProductService } from '@/modules/admin/catalog/product/product.service'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageEntity } from './entities/page.entity'

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name)

  constructor(
    @InjectRepository(PageEntity)
    private pageRepository: Repository<PageEntity>,
    private readonly productService: ProductService,
    private readonly faqService: FaqService,
  ) {}

  async createPage(dto: CreatePageDto, tenantId: string) {
    this.logger.log(`${this.createPage.name} Service Called`)
    // Check slug uniqueness within tenant
    const existing = await this.pageRepository.findOne({ where: { slug: dto.slug, tenantId } })
    if (existing) throw new ConflictException('Slug already exists for this tenant')

    // If setting as home page, unset other home pages for this tenant
    if (dto.isHomePage) {
      await this.pageRepository.update({ tenantId, isHomePage: true }, { isHomePage: false })
    }

    const page = this.pageRepository.create({ ...dto, tenantId })
    return await this.pageRepository.save(page)
  }

  async findAllPages(tenantId: string, status?: string) {
    this.logger.log(`${this.findAllPages.name} Service Called`)
    const where: any = { tenantId }
    if (status) {
      where.status = status
    }
    return await this.pageRepository.find({
      where,
      order: { createdAt: 'DESC' },
    })
  }

  async findOnePage(id: string, tenantId: string) {
    this.logger.log(`${this.findOnePage.name} Service Called`)
    const page = await this.pageRepository.findOne({ where: { id, tenantId } })
    if (!page) throw new NotFoundException('Page not found')
    return page
  }

  async findBySlugPage(slug: string, tenantId: string) {
    this.logger.log(`${this.findBySlugPage.name} Service Called`)
    const page = await this.pageRepository.findOne({ where: { slug, tenantId } })
    if (!page) throw new NotFoundException('Page not found')
    return JSON.parse(JSON.stringify(page))
  }

  async findHomePage(tenantId: string) {
    this.logger.log(`${this.findHomePage.name} Service Called`)
    const homePage = await this.pageRepository.findOne({ where: { isHomePage: true, tenantId } })
    return homePage
  }

  async updatePage(id: string, dto: UpdatePageDto, tenantId: string) {
    this.logger.log(`${this.updatePage.name} Service Called`)
    const page = await this.findOnePage(id, tenantId)

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.pageRepository.findOne({ where: { slug: dto.slug, tenantId } })
      if (existing) throw new ConflictException('Slug already exists for this tenant')
    }

    if (dto.isHomePage && !page.isHomePage) {
      await this.pageRepository.update({ tenantId, isHomePage: true }, { isHomePage: false })
    }

    Object.assign(page, dto)
    return await this.pageRepository.save(page)
  }

  async removePage(id: string, tenantId: string) {
    this.logger.log(`${this.removePage.name} Service Called`)
    const page = await this.findOnePage(id, tenantId)
    await this.pageRepository.remove(page)
    return { success: true }
  }

  async findAllPagesCrossTenant() {
    this.logger.log(`${this.findAllPagesCrossTenant.name} Service Called`)
    return await this.pageRepository.find()
  }

  // Load FAQs for a page with faq-section
  async enrichPageWithFaqs(page: PageEntity) {
    this.logger.log(`${this.enrichPageWithFaqs.name} Service Called`)
    if (!page.sections || page.sections.length === 0) return page

    const enrichedSections = await Promise.all(
      page.sections.map(async (section) => {
        if (section.type === 'faq-section') {
          const source = section.settings?.source || 'page'

          let faqs = []
          if (source === 'page') {
            // Load FAQs linked to this page
            faqs = await this.faqService.findByPageFaq(page.id, page.tenantId)
          } else if (source === 'global') {
            // Load global FAQs (not linked to any page or product)
            faqs = await this.faqService.findGlobalFaqs(page.tenantId)
          } else if (source === 'specific' && section.settings?.faqIds) {
            // Load specific FAQ IDs
            // Would need a findByIds method in FaqService
          }

          return { ...section, data: { faqs } }
        }
        return section
      }),
    )

    return { ...page, sections: enrichedSections }
  }

  async countByTenant(tenantId: string) {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.pageRepository.count({ where: { tenantId } })
  }
}
