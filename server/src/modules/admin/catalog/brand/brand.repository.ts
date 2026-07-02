import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductEntity } from '../product/entities/product.entity'
import { BrandEntity } from './entities/brand.entity'

@Injectable()
export class BrandRepository extends BaseStoreRepository<BrandEntity> {
  constructor(
    @InjectRepository(BrandEntity)
    repo: Repository<BrandEntity>,
  ) {
    super(BrandEntity, repo)
  }

  async findBySlug(slug: string, storeId: string): Promise<BrandEntity | null> {
    return this.repo.findOne({ where: { slug, storeId } })
  }

  async findById(id: string, storeId: string): Promise<BrandEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async findAllByStore(storeId: string): Promise<BrandEntity[]> {
    return this.repo.find({
      where: { storeId },
      order: { name: 'ASC' },
    })
  }

  /**
   * Retrieve all brands across stores. Used when no store context is provided
   * (e.g., super‑admin UI). Returns brands ordered by name.
   */
  async findAll(): Promise<BrandEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } })
  }

  /**
   * Expose a query builder for brands without store filtering.
   */
  getAllBrandsQueryBuilder() {
    return this.repo.createQueryBuilder('brand')
  }

  async findAllWithProductCounts(storeId: string) {
    return this.repo
      .createQueryBuilder('brand')
      .leftJoin('brand.products', 'product')
      .where('brand.storeId = :storeId', { storeId })
      .select([
        'brand.id as id',
        'brand.name as name',
        'brand.slug as slug',
        'brand.description as description',
        'brand.image as image',
        'brand.website as website',
        'brand.createdAt as "createdAt"',
      ])
      .addSelect('COUNT(product.id)', 'productCount')
      .groupBy('brand.id')
      .orderBy('brand.name', 'ASC')
      .getRawMany()
  }

  async createAndSave(data: Partial<BrandEntity>, ctx: RequestContextDto): Promise<BrandEntity> {
    const brand = this.repo.create({
      ...data,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as BrandEntity)
    return this.repo.save(brand)
  }

  async updateAndSave(brand: BrandEntity, data: Partial<BrandEntity>): Promise<BrandEntity> {
    Object.assign(brand, data)
    return this.repo.save(brand)
  }

  async removeBrand(brand: BrandEntity): Promise<void> {
    await this.repo.softRemove(brand)
  }

  async findBrandsForProducts(storeId: string, categoryId?: string) {
    const brandQuery = this.repo
      .createQueryBuilder('brand')
      .innerJoin(ProductEntity, 'product', 'product.brandId = brand.id')
      .where('brand.storeId = :storeId', { storeId })
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
