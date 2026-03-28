import { Injectable, Logger } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ProductEntity } from './entities/product.entity'
import { ProductStatus } from '@/common/enums/product-status.enum'

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
  private readonly logger = new Logger(ProductRepository.name)

  constructor(private dataSource: DataSource) {
    super(ProductEntity, dataSource.createEntityManager())
  }

  async findAllWithFilters(filterDto: any, tenantId: string): Promise<[ProductEntity[], number]> {
    const page = Math.max(1, parseInt(filterDto.page) || 1)
    const limit = Math.max(1, parseInt(filterDto.limit) || 10)
    const { q, status, categoryId, brandId } = filterDto

    const query = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.tenantId = :tenantId', { tenantId })

    if (status) query.andWhere('product.status = :status', { status })
    if (categoryId) query.andWhere('product.categoryId = :categoryId', { categoryId })
    if (brandId) query.andWhere('product.brandId = :brandId', { brandId })
    
    if (filterDto.minPrice !== undefined && filterDto.minPrice !== null) {
      query.andWhere('product.price >= :minPrice', { minPrice: Number(filterDto.minPrice) })
    }
    if (filterDto.maxPrice !== undefined && filterDto.maxPrice !== null) {
      query.andWhere('product.price <= :maxPrice', { maxPrice: Number(filterDto.maxPrice) })
    }
    if (q) {
      query.andWhere('(product.name ILIKE :q OR product.description ILIKE :q)', { q: `%${q}%` })
    }

    if (filterDto.attributes) {
      try {
        const attrFilters = JSON.parse(filterDto.attributes)
        const filteredEntries = Object.entries(attrFilters).filter(
          ([_, v]) => Array.isArray(v) && (v as any).length > 0,
        )

        if (filteredEntries.length > 0) {
          let existsQuery = `SELECT 1 FROM product_variants v WHERE v.product_id = product.id`
          const params: Record<string, any> = {}

          filteredEntries.forEach(([key, values], index) => {
            existsQuery += ` AND v.combination->>:key${index} IN (:...values${index})`
            params[`key${index}`] = key
            params[`values${index}`] = values
          })

          query.andWhere(`EXISTS (${existsQuery})`, params)
        }
      } catch (e) {
        this.logger.error('Failed to parse attributes filter', e)
      }
    }

    return await query
      .orderBy(this.getSortOptions(filterDto.sort))
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }

  async getPriceRange(tenantId: string, categoryId?: string) {
    const query = this.createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .select('MIN(product.price)', 'min')
      .addSelect('MAX(product.price)', 'max')

    if (categoryId) query.andWhere('product.categoryId = :categoryId', { categoryId })
    return query.getRawOne()
  }

  async findBySlugWithRelations(slug: string, tenantId: string): Promise<ProductEntity | null> {
    return this.findOne({
      where: { slug, tenantId },
      relations: ['faqs', 'category', 'attributes', 'variants', 'reviews'],
    })
  }

  async findByIdWithRelations(id: string, tenantId: string): Promise<ProductEntity | null> {
    return this.findOne({
      where: { id, tenantId },
      relations: ['faqs', 'attributes', 'variants', 'category'],
    })
  }

  async findBySlug(slug: string, tenantId: string): Promise<ProductEntity | null> {
    return this.findOne({ where: { slug, tenantId } })
  }

  async createAndSave(data: any, tenantId: string): Promise<ProductEntity> {
    const product = this.create({
      ...data,
      tenantId,
      stock: 0,
    } as ProductEntity)
    return this.save(product)
  }

  async updateAndSave(product: ProductEntity, data: any): Promise<ProductEntity> {
    if ('categoryId' in data) product.category = null as any
    Object.assign(product, data)
    return this.save(product)
  }

  async removeProduct(product: ProductEntity): Promise<void> {
    await this.remove(product)
  }

  async findLatestProducts(tenantId: string, limit: number): Promise<ProductEntity[]> {
    return this.find({
      where: { tenantId },
      relations: ['variants', 'category'],
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async findAllCrossTenant(): Promise<ProductEntity[]> {
    return this.find()
  }

  async countProducts(tenantId: string): Promise<number> {
    return this.count({ where: { tenantId } })
  }

  async getOverviewStats(): Promise<{ totalProducts: number; activeProducts: number; inactiveProducts: number }> {
    const totalProducts = await this.count()
    const activeProducts = await this.count({ where: { status: ProductStatus.ACTIVE } })
    const inactiveProducts = await this.count({ where: { status: ProductStatus.INACTIVE } })
    
    return { totalProducts, activeProducts, inactiveProducts }
  }

  private getSortOptions(sort?: string): any {
    switch (sort) {
      case 'price-low':
        return { 'product.price': 'ASC' }
      case 'price-high':
        return { 'product.price': 'DESC' }
      case 'name-asc':
        return { 'product.name': 'ASC' }
      case 'name-desc':
        return { 'product.name': 'DESC' }
      case 'newest':
      default:
        return { 'product.createdAt': 'DESC' }
    }
  }
}
