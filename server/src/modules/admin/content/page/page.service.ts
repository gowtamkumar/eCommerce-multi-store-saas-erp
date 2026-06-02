import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PageStatus } from '@/common/enums/page-status.enum'
import { FaqService } from '@/modules/admin/content/faq/faq.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageEntity } from './entities/page.entity'
import { PageRevisionRepository } from './page-revision.repository'
import { PageRepository } from './page.repository'
import { validateAndSanitizeSections } from './utils/page-html-sanitizer.util'
import { normalizePageSlug } from './utils/page-slug.util'

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name)
  private readonly CACHE_TTL = 300
  private readonly HOME_CACHE_TTL = 3600

  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageRevisionRepository: PageRevisionRepository,
    private readonly faqService: FaqService,
    private readonly cache: CacheService,
  ) {}

  private prepareDto(
    dto: CreatePageDto | UpdatePageDto,
    isPartialUpdate = false,
  ): Partial<PageEntity> {
    const prepared = { ...dto } as unknown as Partial<PageEntity>

    if (dto.isHomePage === true) {
      prepared.slug = ''
    } else {
      const hasSlug = dto.slug !== undefined && dto.slug !== null && dto.slug.trim() !== '';
      if (hasSlug) {
        prepared.slug = normalizePageSlug(dto.slug, false)
      } else if (dto.slug === '' || dto.slug === null) {
        // Explicitly cleared or empty slug -> auto-generate from title
        prepared.slug = dto.title ? normalizePageSlug(dto.title, false) : ''
      } else if (!isPartialUpdate) {
        // Creation, slug is undefined -> auto-generate from title
        prepared.slug = dto.title ? normalizePageSlug(dto.title, false) : ''
      }
    }

    if (dto.sections !== undefined) {
      try {
        prepared.sections = validateAndSanitizeSections(dto.sections) as PageEntity['sections']
      } catch (err) {
        throw new BadRequestException(err instanceof Error ? err.message : 'Invalid sections')
      }
    }

    // Scheduled publish: empty string clears it, valid ISO sets status to SCHEDULED.
    if (dto.publishAt !== undefined) {
      if (dto.publishAt === null || dto.publishAt === '') {
        prepared.publishAt = null
      } else {
        const when = new Date(dto.publishAt)
        if (isNaN(when.getTime())) {
          throw new BadRequestException('publishAt must be a valid ISO timestamp')
        }
        prepared.publishAt = when
        if (when.getTime() > Date.now()) {
          prepared.status = PageStatus.SCHEDULED
        }
      }
    }

    return prepared
  }

  private assertPublishedForPublic(page: PageEntity | null): PageEntity {
    if (!page) throw new NotFoundException('Page not found')
    if (page.status !== PageStatus.PUBLISHED) {
      throw new NotFoundException('Page not found')
    }
    return page
  }

  async createPage(dto: CreatePageDto, ctx: RequestContextDto): Promise<PageEntity> {
    this.logger.log(`${this.createPage.name} Service Called`)
    const prepared = this.prepareDto(dto, false)
    if (!prepared.isHomePage && !prepared.slug) {
      throw new BadRequestException('slug is required for non-home pages')
    }

    const existing = await this.pageRepository.findBySlug(prepared.slug!, ctx)
    if (existing) throw new ConflictException('Slug already exists for this tenant')

    if (prepared.isHomePage) {
      await this.pageRepository.unsetHomePage(ctx)
      await this.invalidatePageCache(ctx, 'home')
      return this.pageRepository.createAndSave({ ...prepared, isHomePage: true, slug: '' }, ctx)
    }

    return await this.pageRepository.createAndSave(prepared, ctx)
  }

  /**
   * Admin listing: callers can filter by any status. The route must be
   * guarded — never expose this without authentication.
   */
  async findAllPages(ctx: RequestContextDto, status?: string): Promise<PageEntity[]> {
    this.logger.log(`${this.findAllPages.name} Service Called`)
    return await this.pageRepository.findAllWithStatus(ctx, status, { publishedOnly: false })
  }

  /**
   * Storefront listing: always forced to published-only. Used by sitemap,
   * footer navigation, and any other public surface.
   */
  async findAllPagesPublic(ctx: RequestContextDto): Promise<PageEntity[]> {
    this.logger.log(`${this.findAllPagesPublic.name} Service Called`)
    return await this.pageRepository.findAllWithStatus(ctx, undefined, { publishedOnly: true })
  }

  async findOnePage(id: string, ctx: RequestContextDto): Promise<PageEntity> {
    this.logger.log(`${this.findOnePage.name} Service Called`)
    const page = await this.pageRepository.findById(id, ctx)
    if (!page) throw new NotFoundException('Page not found')
    return page
  }

  async findBySlugPage(slug: string, ctx: RequestContextDto): Promise<PageEntity> {
    this.logger.log(`${this.findBySlugPage.name} Service Called`)
    await this.runScheduledPublishingForTenant(ctx.tenantId)
    const normalizedSlug = normalizePageSlug(slug, false)
    const cacheKey = `slug:${normalizedSlug}`
    const tenantId = ctx.tenantId

    const cached = await this.cache.getCache<PageEntity>(cacheKey, tenantId)
    if (cached) {
      if (cached.status !== PageStatus.PUBLISHED) throw new NotFoundException('Page not found')
      return cached
    }

    const page = this.assertPublishedForPublic(
      await this.pageRepository.findBySlug(normalizedSlug, ctx, { publishedOnly: true }),
    )

    const enriched = await this.enrichPageWithFaqs(page, ctx)
    const result = JSON.parse(JSON.stringify(enriched))

    await this.cache.setCache(cacheKey, result, this.CACHE_TTL, tenantId)
    return result
  }

  async findHomePage(ctx: RequestContextDto): Promise<PageEntity | null> {
    this.logger.log(`${this.findHomePage.name} Service Called`)
    await this.runScheduledPublishingForTenant(ctx.tenantId)
    const cacheKey = `home`
    const tenantId = ctx.tenantId

    const cached = await this.cache.getCache<PageEntity>(cacheKey, tenantId)
    if (cached) {
      if (cached.status !== PageStatus.PUBLISHED) return null
      return cached
    }

    const page = await this.pageRepository.findHomePage(ctx, { publishedOnly: true })
    if (!page) return null

    const enriched = await this.enrichPageWithFaqs(page, ctx)
    const result = JSON.parse(JSON.stringify(enriched))

    await this.cache.setCache(cacheKey, result, this.HOME_CACHE_TTL, tenantId)
    return result
  }

  async updatePage(id: string, dto: UpdatePageDto, ctx: RequestContextDto): Promise<PageEntity> {
    this.logger.log(`${this.updatePage.name} Service Called`)
    const page = await this.findOnePage(id, ctx)
    const prepared = this.prepareDto(dto, true)
    const oldSlug = page.slug

    if (prepared.slug !== undefined && prepared.slug !== page.slug) {
      const existing = await this.pageRepository.findBySlug(prepared.slug, ctx)
      if (existing && existing.id !== page.id) {
        throw new ConflictException('Slug already exists for this tenant')
      }
      await this.invalidatePageCache(ctx, oldSlug)
    }

    const becomingHome = prepared.isHomePage === true && !page.isHomePage
    const payload = { ...prepared }
    if (payload.isHomePage) {
      payload.slug = ''
    }

    let updated: PageEntity
    if (becomingHome) {
      await this.invalidatePageCache(ctx, 'home')
      updated = await this.pageRepository.setHomePageTransactional(page, payload)
    } else {
      if (prepared.isHomePage === false && page.isHomePage) {
        payload.slug = payload.slug ?? page.slug
      }
      updated = await this.pageRepository.updateAndSave(page, payload)
    }

    await this.invalidatePageCache(ctx, updated.slug)
    if (updated.isHomePage) await this.invalidatePageCache(ctx, 'home')
    if (oldSlug && oldSlug !== updated.slug) await this.invalidatePageCache(ctx, oldSlug)

    // Snapshot every successful update so the editor can browse and revert.
    try {
      await this.pageRevisionRepository.createSnapshot(
        {
          pageId: updated.id,
          title: updated.title,
          slug: updated.slug,
          sections: updated.sections,
          typography: updated.typography,
          metaTitle: updated.metaTitle,
          metaDescription: updated.metaDescription,
          ogImage: updated.ogImage,
          note: dto.publishAt ? 'Scheduled save' : null,
        },
        ctx,
      )
    } catch (err) {
      // Snapshot failure must never break a save; log only.
      this.logger.warn(`Failed to snapshot page ${updated.id}: ${(err as Error).message}`)
    }

    return updated
  }

  async listRevisions(pageId: string, ctx: RequestContextDto) {
    await this.findOnePage(pageId, ctx)
    return this.pageRevisionRepository.list(pageId, ctx)
  }

  async restoreRevision(
    pageId: string,
    revisionId: string,
    ctx: RequestContextDto,
  ): Promise<PageEntity> {
    const page = await this.findOnePage(pageId, ctx)
    const revision = await this.pageRevisionRepository.findOne(revisionId, ctx)
    if (!revision || revision.pageId !== pageId) {
      throw new NotFoundException('Revision not found')
    }
    Object.assign(page, {
      title: revision.title,
      slug: revision.slug,
      sections: revision.sections,
      typography: revision.typography,
      metaTitle: revision.metaTitle,
      metaDescription: revision.metaDescription,
      ogImage: revision.ogImage,
    })
    const saved = await this.pageRepository.updateAndSave(page, page)
    await this.invalidatePageCache(ctx, saved.slug)
    if (saved.isHomePage) await this.invalidatePageCache(ctx, 'home')
    return saved
  }

  /**
   * Lazy scheduler: every time a tenant's storefront is touched we check that
   * tenant's own scheduled pages and publish anything that is due. This avoids
   * needing a background worker while still feeling immediate to the visitor.
   */
  private async runScheduledPublishingForTenant(tenantId: string): Promise<void> {
    try {
      const due = await this.pageRepository.findScheduledDue(new Date(), tenantId)
      if (!due.length) return
      for (const page of due) {
        page.status = PageStatus.PUBLISHED
        page.publishAt = null
        await this.pageRepository.updateAndSave(page, page)
        await this.cache.delCache(`slug:${page.slug}`, tenantId)
        if (page.isHomePage) await this.cache.delCache('home', tenantId)
        this.logger.log(`Auto-published scheduled page ${page.id} (${page.slug || 'home'})`)
      }
    } catch (err) {
      this.logger.error('Scheduled publishing job failed', err as Error)
    }
  }

  async removePage(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`${this.removePage.name} Service Called`)
    const page = await this.findOnePage(id, ctx)
    await this.pageRepository.removePage(page)
    await this.invalidatePageCache(ctx, page.slug)
    if (page.isHomePage) await this.invalidatePageCache(ctx, 'home')

    return { success: true, message: 'Page deleted successfully' }
  }

  async findAllPagesCrossTenant(): Promise<PageEntity[]> {
    this.logger.log(`${this.findAllPagesCrossTenant.name} Service Called`)
    return await this.pageRepository.findAllCrossTenant()
  }

  async enrichPageWithFaqs(page: PageEntity, ctx: RequestContextDto): Promise<PageEntity> {
    this.logger.log(`${this.enrichPageWithFaqs.name} Service Called`)
    if (!page.sections || page.sections.length === 0) return page

    const faqSections = page.sections.filter((s) => s.type === ('faq-section' as any))
    if (faqSections.length === 0) return page

    const specificFaqIds = new Set<string>()
    let needsGlobal = false
    let needsPageFaqs = false

    faqSections.forEach((section) => {
      const source = section.settings?.source || 'page'
      if (source === 'page') needsPageFaqs = true
      else if (source === 'global') needsGlobal = true
      else if (source === 'specific' && section.settings?.faqIds) {
        section.settings.faqIds.forEach((faqId: string) => specificFaqIds.add(faqId))
      }
    })

    const [pageFaqs, globalFaqs, specificFaqs] = await Promise.all([
      needsPageFaqs ? this.faqService.findByPageFaq(page.id, ctx) : Promise.resolve([]),
      needsGlobal ? this.faqService.findGlobalFaqs(ctx) : Promise.resolve([]),
      specificFaqIds.size > 0
        ? this.faqService.findByIdsFaq(Array.from(specificFaqIds), ctx)
        : Promise.resolve([]),
    ])

    const enrichedSections = page.sections.map((section) => {
      if (section.type === ('faq-section' as any)) {
        const source = section.settings?.source || 'page'
        let faqs = []
        if (source === 'page') faqs = pageFaqs
        else if (source === 'global') faqs = globalFaqs
        else if (source === 'specific' && section.settings?.faqIds) {
          faqs = specificFaqs.filter((f) => section.settings.faqIds.includes(f.id))
        }
        return { ...section, data: { faqs } }
      }
      return section
    })

    return { ...page, sections: enrichedSections } as PageEntity
  }

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.pageRepository.countByTenant(ctx)
  }

  /** Invalidate storefront page caches for a tenant (e.g. after FAQ updates). */
  async invalidateAllPageCachesForTenant(tenantId: string): Promise<void> {
    await this.cache.delCache('home', tenantId)
    const pages = await this.pageRepository.findAllWithStatus(
      { tenantId } as RequestContextDto,
      undefined,
      { publishedOnly: false },
    )
    await Promise.all(
      pages.filter((p) => p.slug).map((p) => this.cache.delCache(`slug:${p.slug}`, tenantId)),
    )
  }

  private async invalidatePageCache(ctx: RequestContextDto, slug?: string) {
    const tenantId = ctx.tenantId
    if (slug === 'home') {
      await this.cache.delCache('home', tenantId)
    } else if (slug) {
      await this.cache.delCache(`slug:${slug}`, tenantId)
    }
  }
}
