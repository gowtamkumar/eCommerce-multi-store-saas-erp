import { Injectable } from '@nestjs/common'
import { CategoryRepository } from '../../admin/catalog/category/category.repository'
import { ProductRepository } from '../../admin/catalog/product/product.repository'
import { SiteSettingsRepository } from '../../admin/settings/site-settings.repository'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { CategoryEntity } from '../../admin/catalog/category/entities/category.entity'
import { ProductEntity } from '../../admin/catalog/product/entities/product.entity'

@Injectable()
export class SeoService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly siteSettingsRepository: SiteSettingsRepository,
  ) {}

  async getSitemapData(tenantId: string): Promise<{ categories: CategoryEntity[]; products: ProductEntity[] }> {
    const categories = await this.categoryRepository.find({
      where: { tenantId },
      select: ['slug', 'updatedAt'] as any,
    })

    const products = await this.productRepository.find({
      where: {
        tenantId,
        status: ProductStatus.ACTIVE, // Corrected status
      },
      select: ['slug', 'updatedAt'] as any,
    })

    return { categories, products }
  }

  async getRobotsTxt(tenantId: string): Promise<string> {
    const settings = await this.siteSettingsRepository.findOne({
      where: { tenantId },
      select: ['robotsTxt'] as any,
    })
    return settings?.robotsTxt || 'User-agent: *\nAllow: /'
  }
}
