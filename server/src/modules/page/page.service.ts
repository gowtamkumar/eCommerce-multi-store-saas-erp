import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FaqService } from '../faq/faq.service'
import { ProductService } from '../product/product.service'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageEntity } from './entities/page.entity'

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(PageEntity)
    private pageRepository: Repository<PageEntity>,
       private readonly productService: ProductService,
            private readonly faqService: FaqService,
  ) { }

  async create(dto: CreatePageDto, tenantId: string) {
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

  async findAll(tenantId: string) {
    return await this.pageRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string, tenantId: string) {
    const page = await this.pageRepository.findOne({ where: { id, tenantId } })
    if (!page) throw new NotFoundException('Page not found')
    return page
  }

  async findBySlug(slug: string, tenantId: string) {
    const page = await this.pageRepository.findOne({ where: { slug, tenantId } })
    if (!page) throw new NotFoundException('Page not found')
    return JSON.parse(JSON.stringify(page));
  }

  async findHomePage(tenantId: string) {
    const [latestProducts, faqs, homePage] = await Promise.all([
      this.productService.findLatest(tenantId, 8),
      this.faqService.findAll({ status: 'active', page: 1, limit: 100 }, tenantId),
      this.pageRepository.findOne({ where: { isHomePage: true, tenantId } }).catch(() => null),
    ]);

    return {
      products: latestProducts,
      faqs,
      page: homePage,
    };
  }

  async update(id: string, dto: UpdatePageDto, tenantId: string) {
    const page = await this.findOne(id, tenantId)

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

  async remove(id: string, tenantId: string) {
    const page = await this.findOne(id, tenantId)
    await this.pageRepository.remove(page)
    return { success: true }
  }

  async findAllPagesCrossTenant() {
    return await this.pageRepository.find()
  }

  async countByTenant(tenantId: string) {
    return await this.pageRepository.count({ where: { tenantId } });
  }
}
