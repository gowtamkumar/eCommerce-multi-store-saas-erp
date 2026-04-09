import { ProductService } from '@/modules/admin/catalog/product/product.service'
import { FaqService } from '@/modules/admin/content/faq/faq.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageEntity } from './entities/page.entity'
import { PageRepository } from './page.repository'

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name)
  // 5 minutes for regular pages; home page uses a longer TTL below
  private readonly CACHE_TTL = 300
  private readonly HOME_CACHE_TTL = 3600 // 1 hour - home page changes infrequently

  constructor(
    private readonly pageRepository: PageRepository,
    private readonly productService: ProductService,
    private readonly faqService: FaqService,
    private readonly cache: CacheService,
  ) { }

  async createPage(dto: CreatePageDto, tenantId: string): Promise<PageEntity> {
    this.logger.log(`${this.createPage.name} Service Called`)
    const existing = await this.pageRepository.findBySlug(dto.slug, tenantId)
    if (existing) throw new ConflictException('Slug already exists for this tenant')

    if (dto.isHomePage) {
      await this.pageRepository.unsetHomePage(tenantId)
      await this.invalidatePageCache(tenantId, 'home')
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
    const cacheKey = `slug:${slug}`

    const cached = await this.cache.getCache<PageEntity>(cacheKey, tenantId)
    if (cached) return cached

    const page = await this.pageRepository.findBySlug(slug, tenantId)
    if (!page) throw new NotFoundException('Page not found')

    // Enrich with FAQ data before caching (Critical Fix)
    const enriched = await this.enrichPageWithFaqs(page)
    const result = JSON.parse(JSON.stringify(enriched))
    
    await this.cache.setCache(cacheKey, result, this.CACHE_TTL, tenantId)
    return result
  }

  async findHomePage(tenantId: string): Promise<PageEntity | null> {
    this.logger.log(`${this.findHomePage.name} Service Called`)
    const cacheKey = `home`

    const cached = await this.cache.getCache<PageEntity>(cacheKey, tenantId)
    if (cached) return cached

    const page = await this.pageRepository.findHomePage(tenantId)
    if (!page) return null

    // Enrich with FAQ data before caching (Critical Fix)
    const enriched = await this.enrichPageWithFaqs(page)
    const result = JSON.parse(JSON.stringify(enriched))

    await this.cache.setCache(cacheKey, result, this.HOME_CACHE_TTL, tenantId)
    return result
  }

  async updatePage(id: string, dto: UpdatePageDto, tenantId: string): Promise<PageEntity> {
    this.logger.log(`${this.updatePage.name} Service Called`)
    const page = await this.findOnePage(id, tenantId)

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.pageRepository.findBySlug(dto.slug, tenantId)
      if (existing) throw new ConflictException('Slug already exists for this tenant')
      await this.invalidatePageCache(tenantId, page.slug)
    }

    if (dto.isHomePage && !page.isHomePage) {
      await this.pageRepository.unsetHomePage(tenantId)
      await this.invalidatePageCache(tenantId, 'home')
    }

    const updated = await this.pageRepository.updateAndSave(page, dto)
    await this.invalidatePageCache(tenantId, updated.slug)
    if (updated.isHomePage) await this.invalidatePageCache(tenantId, 'home')

    return updated
  }

  async removePage(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`${this.removePage.name} Service Called`)
    const page = await this.findOnePage(id, tenantId)
    await this.pageRepository.removePage(page)
    await this.invalidatePageCache(tenantId, page.slug)
    if (page.isHomePage) await this.invalidatePageCache(tenantId, 'home')

    return { success: true, message: 'Page deleted successfully' }
  }

  async findAllPagesCrossTenant(): Promise<PageEntity[]> {
    this.logger.log(`${this.findAllPagesCrossTenant.name} Service Called`)
    return await this.pageRepository.findAllCrossTenant()
  }

  // Optimized: Load FAQs as a single batch operation instead of per-section redundant calls
  async enrichPageWithFaqs(page: PageEntity): Promise<PageEntity> {
    this.logger.log(`${this.enrichPageWithFaqs.name} Service Called`)
    if (!page.sections || page.sections.length === 0) return page

    const faqSections = page.sections.filter(s => s.type === 'faq-section' as any)
    if (faqSections.length === 0) return page

    // Collect all specific IDs and handle "global" vs "page" logic separately
    const specificFaqIds = new Set<string>()
    let needsGlobal = false
    let needsPageFaqs = false

    faqSections.forEach(section => {
      const source = section.settings?.source || 'page'
      if (source === 'page') needsPageFaqs = true
      else if (source === 'global') needsGlobal = true
      else if (source === 'specific' && section.settings?.faqIds) {
        section.settings.faqIds.forEach((id: string) => specificFaqIds.add(id))
      }
    })

    // Batch fetch needed data
    const [pageFaqs, globalFaqs, specificFaqs] = await Promise.all([
      needsPageFaqs ? this.faqService.findByPageFaq(page.id, page.tenantId) : Promise.resolve([]),
      needsGlobal ? this.faqService.findGlobalFaqs(page.tenantId) : Promise.resolve([]),
      specificFaqIds.size > 0 ? this.faqService.findByIdsFaq(Array.from(specificFaqIds), page.tenantId) : Promise.resolve([])
    ])

    const enrichedSections = page.sections.map((section) => {
      if (section.type === 'faq-section' as any) {
        const source = section.settings?.source || 'page'
        let faqs = []
        if (source === 'page') faqs = pageFaqs
        else if (source === 'global') faqs = globalFaqs
        else if (source === 'specific' && section.settings?.faqIds) {
          faqs = specificFaqs.filter(f => section.settings.faqIds.includes(f.id))
        }
        return { ...section, data: { faqs } }
      }
      return section
    })

    return { ...page, sections: enrichedSections } as PageEntity
  }

  async countByTenant(tenantId: string): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.pageRepository.countByTenant(tenantId)
  }

  private async invalidatePageCache(tenantId: string, slug?: string) {
    if (slug === 'home') {
      await this.cache.delCache('home', tenantId)
    } else if (slug) {
      await this.cache.delCache(`slug:${slug}`, tenantId)
    }
  }
}
