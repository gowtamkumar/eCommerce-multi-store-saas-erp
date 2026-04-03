import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductEntity } from '../product/entities/product.entity'
import { BrandEntity } from './entities/brand.entity'

@Injectable()
export class BrandRepository {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly repo: Repository<BrandEntity>,
  ) { }

  async findBySlug(slug: string, tenantId: string): Promise<BrandEntity | null> {
    return this.repo.findOne({ where: { slug, tenantId } })
  }

  async findById(id: string, tenantId: string): Promise<BrandEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async findAllByTenant(tenantId: string): Promise<BrandEntity[]> {
    return this.repo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async createAndSave(data: Partial<BrandEntity>): Promise<BrandEntity> {
    const brand = this.repo.create(data as BrandEntity)
    return this.repo.save(brand)
  }

  async updateAndSave(brand: BrandEntity, data: Partial<BrandEntity>): Promise<BrandEntity> {
    Object.assign(brand, data)
    return this.repo.save(brand)
  }

  async removeBrand(brand: BrandEntity): Promise<void> {
    await this.repo.softRemove(brand)
  }

  async findBrandsForProducts(tenantId: string, categoryId?: string) {
    const brandQuery = this.repo.createQueryBuilder('brand')
      .innerJoin(ProductEntity, 'product', 'product.brandId = brand.id')
      .where('brand.tenantId = :tenantId', { tenantId })
      .select('brand.id', 'id')
      .addSelect('brand.name', 'name')
      .addSelect('brand.slug', 'slug')
      .distinct(true)

    if (categoryId) {
      brandQuery.andWhere('product.categoryId = :categoryId', { categoryId })
    }
    return brandQuery.getRawMany()
  }

}
