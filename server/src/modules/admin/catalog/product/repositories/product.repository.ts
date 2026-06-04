import { ProductStatus } from '@/common/enums/product-status.enum'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductEntity } from '../entities/product.entity'
import { PromotionTargetType } from '@/modules/admin/sales/promotion/enums/promotion-target-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ProductRepository {
  private readonly logger = new Logger(ProductRepository.name)

  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findAllWithFilters(filterDto: any, tenantId: string): Promise<[ProductEntity[], number]> {
    const page = Math.max(1, parseInt(filterDto.page) || 1)
    const limit = Math.max(1, parseInt(filterDto.limit) || 10)
    const { q, status, categoryId, brandId, exclude, lowStock } = filterDto

    const query = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.tenantId = :tenantId', { tenantId })

    if (status) query.andWhere('product.status = :status', { status })
    if (categoryId) query.andWhere('product.categoryId = :categoryId', { categoryId })
    if (brandId) query.andWhere('product.brandId = :brandId', { brandId })
    if (exclude) query.andWhere('product.id != :exclude', { exclude })

    if (lowStock === 'true') {
      const stockSubquery = `COALESCE((
        SELECT SUM(il.quantity)
        FROM inventory_ledger il
        WHERE il.product_id = product.id
          AND il.tenant_id = :tenantId
      ), 0)`
      query.andWhere(`${stockSubquery} <= product.low_stock_threshold`)
    }

    const finalPriceExpr = `CASE 
      WHEN product.discount_type = 'percentage' 
      THEN (product.price * (1 - product.discount_amount / 100)) * (1 + COALESCE(product.tax_rate, 0) / 100)
      WHEN product.discount_type = 'fixed' 
      THEN (product.price - product.discount_amount) * (1 + COALESCE(product.tax_rate, 0) / 100)
      ELSE product.price * (1 + COALESCE(product.tax_rate, 0) / 100)
    END`

    if (filterDto.minPrice !== undefined && filterDto.minPrice !== null) {
      query.andWhere(`${finalPriceExpr} >= :minPrice`, { minPrice: Number(filterDto.minPrice) })
    }
    if (filterDto.maxPrice !== undefined && filterDto.maxPrice !== null) {
      query.andWhere(`${finalPriceExpr} <= :maxPrice`, { maxPrice: Number(filterDto.maxPrice) })
    }
    if (q) {
      query.andWhere(
        '(product.name ILIKE :q OR product.description ILIKE :q OR product.sku ILIKE :q OR product.barcode ILIKE :q OR variants.sku ILIKE :q OR variants.barcode ILIKE :q)',
        { q: `%${q}%` },
      )
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
            existsQuery += ` AND v.combination->>'key${index}' IN (:...values${index})`
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
    const finalPriceExpr = `CASE 
      WHEN product.discount_type = 'percentage' 
      THEN (product.price * (1 - product.discount_amount / 100)) * (1 + COALESCE(product.tax_rate, 0) / 100)
      WHEN product.discount_type = 'fixed'
      THEN (product.price - product.discount_amount) * (1 + COALESCE(product.tax_rate, 0) / 100)
      ELSE product.price * (1 + COALESCE(product.tax_rate, 0) / 100)
    END`

    const query = this.repo
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .select(`MIN(${finalPriceExpr})`, 'min')
      .addSelect(`MAX(${finalPriceExpr})`, 'max')

    if (categoryId) query.andWhere('product.categoryId = :categoryId', { categoryId })
    return await query.getRawOne()
  }

  async findBySlugWithRelations(slug: string, tenantId: string): Promise<ProductEntity | null> {
    return this.repo.findOne({
      where: { slug, tenantId },
      relations: ['faqs', 'category', 'attributes', 'variants', 'reviews'],
    })
  }

  async findByIdWithRelations(id: string, tenantId: string): Promise<ProductEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['faqs', 'attributes', 'variants', 'category', 'supplier'],
    })
  }

  async findProductById(id: string, tenantId: string): Promise<ProductEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['variants'],
    })
  }

  async findBySlug(slug: string, tenantId: string): Promise<ProductEntity | null> {
    return this.repo.findOne({ where: { slug, tenantId } })
  }

  async createAndSave(data: any, ctx: RequestContextDto): Promise<ProductEntity> {
    const product = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      stock: 0,
    } as ProductEntity)
    return this.repo.save(product)
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } })
  }

  async updateAndSave(product: ProductEntity, data: any, manager?: any): Promise<ProductEntity> {
    const repo = manager ? manager.getRepository(ProductEntity) : this.repo

    // When updating raw IDs (categoryId, brandId, supplierId), we must
    // remove the corresponding relation objects if they are already loaded.
    // Setting to null would explicitly unset the relation in the DB,
    // while 'delete' tells TypeORM to ignore the relation and use the ID scalar instead.
    if ('categoryId' in data) delete (product as any).category
    if ('brandId' in data) delete (product as any).brand
    if ('supplierId' in data) delete (product as any).supplier

    Object.assign(product, data)
    return repo.save(product)
  }

  async updateAverageCost(
    id: string,
    tenantId: string,
    newCost: number,
    manager?: any,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(ProductEntity) : this.repo
    await repo.update({ id, tenantId }, { averageCost: newCost })
  }

  async removeProduct(product: ProductEntity): Promise<void> {
    await this.repo.softRemove(product)
  }

  async findLatestProducts(tenantId: string, limit: number): Promise<ProductEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['variants', 'category'],
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async findAllCrossTenant(): Promise<ProductEntity[]> {
    return this.repo.find()
  }

  async countProducts(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } })
  }

  async getOverviewStats(): Promise<{
    totalProducts: number
    activeProducts: number
    inactiveProducts: number
  }> {
    const stats = await this.repo
      .createQueryBuilder('product')
      .select('COUNT(*)', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE status = :active)`, 'active')
      .addSelect(`COUNT(*) FILTER (WHERE status = :inactive)`, 'inactive')
      .setParameters({
        active: ProductStatus.ACTIVE,
        inactive: ProductStatus.INACTIVE,
      })
      .getRawOne()

    return {
      totalProducts: parseInt(stats.total, 10),
      activeProducts: parseInt(stats.active, 10),
      inactiveProducts: parseInt(stats.inactive, 10),
    }
  }

  async findOfferProducts(params: {
    tenantId: string
    targetType?: string
    targetId?: string
    limit?: number
  }): Promise<ProductEntity[]> {
    const { tenantId, targetType, targetId, limit = 20 } = params
    const query = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.stock > 0')
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.price',
        'product.discountAmount',
        'product.images',
        'product.shortDescription',
        'product.stock',
        'product.categoryId',
        'product.brandId',
        'product.createdAt',
        'category.id',
        'category.name',
        'category.slug',
        'brand.id',
        'brand.name',
      ])

    if (targetType === PromotionTargetType.SPECIFIC_PRODUCT && targetId) {
      query.andWhere('product.id = :id', { id: targetId })
      const product = await query.getOne()
      return product ? [product] : []
    } else if (targetType === PromotionTargetType.SPECIFIC_CATEGORY && targetId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId: targetId })
    } else if (targetType === PromotionTargetType.SPECIFIC_BRAND && targetId) {
      query.andWhere('product.brandId = :brandId', { brandId: targetId })
    }

    return await query.orderBy('product.createdAt', 'DESC').take(limit).getMany()
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
