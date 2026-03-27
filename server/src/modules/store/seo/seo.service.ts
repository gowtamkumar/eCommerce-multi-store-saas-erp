import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoryEntity } from '../../admin/catalog/category/entities/category.entity'
import { ProductEntity } from '../../admin/catalog/product/entities/product.entity'
import { SiteSettingsEntity } from '../../admin/settings/entities/site-settings.entity'
import { ProductStatus } from '@/common/enums/product-status.enum'

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(SiteSettingsEntity)
    private readonly siteSettingsRepository: Repository<SiteSettingsEntity>,
  ) {}

  async getSitemapData(tenantId: string) {
    const categories = await this.categoryRepository.find({
      where: { tenantId },
      select: ['slug', 'updatedAt'],
    })

    const products = await this.productRepository.find({
      where: {
        tenantId,
        status: ProductStatus.ACTIVE, // Corrected status
      },
      select: ['slug', 'updatedAt'],
    })

    return { categories, products }
  }

  async getRobotsTxt(tenantId: string): Promise<string> {
    const settings = await this.siteSettingsRepository.findOne({
      where: { tenantId },
      select: ['robotsTxt'],
    })
    return settings?.robotsTxt || 'User-agent: *\nAllow: /'
  }
}
