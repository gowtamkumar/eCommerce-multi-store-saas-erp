import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ProductEntity } from '../product/entities/product.entity'
import { BrandEntity } from './entities/brand.entity'

@Injectable()
export class BrandRepository extends Repository<BrandEntity> {
  constructor(private dataSource: DataSource) {
    super(BrandEntity, dataSource.createEntityManager())
  }

  async findBySlug(slug: string, tenantId: string): Promise<BrandEntity | null> {
    return this.findOne({ where: { slug, tenantId } })
  }

  async findById(id: string, tenantId: string): Promise<BrandEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async findAllByTenant(tenantId: string): Promise<BrandEntity[]> {
    return this.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async createAndSave(data: Partial<BrandEntity>): Promise<BrandEntity> {
    const brand = this.create(data as BrandEntity)
    return this.save(brand)
  }

  async updateAndSave(brand: BrandEntity, data: Partial<BrandEntity>): Promise<BrandEntity> {
    Object.assign(brand, data)
    return this.save(brand)
  }

  async removeBrand(brand: BrandEntity): Promise<void> {
    await this.softRemove(brand)
  }

  async findBrandsForProducts(tenantId: string, categoryId?: string) {
    const brandQuery = this.createQueryBuilder('brand')
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
