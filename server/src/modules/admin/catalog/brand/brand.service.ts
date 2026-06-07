import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { BrandRepository } from './brand.repository'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'
import { BrandEntity } from './entities/brand.entity'

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name)

  constructor(
    private readonly brandRepo: BrandRepository,
    private readonly cache: CacheService,
  ) {}

  async createBrand(createBrandDto: CreateBrandDto, ctx: RequestContextDto): Promise<BrandEntity> {
    this.logger.log(`${this.createBrand.name} Service Called`)
    const tenantId = ctx.tenantId

    const existing = await this.brandRepo.findBySlug(createBrandDto.slug, tenantId)

    if (existing) {
      throw new ConflictException('Brand with this slug already exists')
    }

    const result = await this.brandRepo.createAndSave(createBrandDto, ctx)
    await this.cache.delCache(`brands:list`, tenantId)
    await this.cache.delCache(`brands:stats`, tenantId)
    return result
  }

  async findAllBrands(ctx: RequestContextDto): Promise<BrandEntity[]> {
    this.logger.log(`${this.findAllBrands.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `brands:list`

    const fetchFn = async () => {
      if (tenantId) {
        return this.brandRepo.findAllByTenant(tenantId)
      }
      // No tenant – return all brands across tenants.
      return this.brandRepo.findAll()
    }

    return this.cache.rememberCache(cacheKey, fetchFn, 600, tenantId)
  }

  async findAllBrandsWithStats(ctx: RequestContextDto) {
    this.logger.log(`${this.findAllBrandsWithStats.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `brands:stats`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        if (tenantId) {
          const results = await this.brandRepo.findAllWithProductCounts(tenantId)
          return results.map((r) => ({
            ...r,
            productCount: Number(r.productCount || 0),
          }))
        }
        // No tenant – compute stats for all brands.
        const qb = this.brandRepo.getAllBrandsQueryBuilder()
        const results = await qb
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
          .leftJoin('brand.products', 'product')
          .groupBy('brand.id')
          .orderBy('brand.name', 'ASC')
          .getRawMany()
        return results.map((r) => ({
          ...r,
          productCount: Number(r.productCount || 0),
        }))
      },
      600, // 10 minutes
      tenantId,
    )
  }

  async findOneBrand(id: string, ctx: RequestContextDto): Promise<BrandEntity> {
    this.logger.log(`${this.findOneBrand.name} Service Called`)
    const tenantId = ctx.tenantId
    const brand = await this.brandRepo.findById(id, tenantId)

    if (!brand) {
      throw new NotFoundException('Brand not found')
    }

    return brand
  }

  async updateBrand(
    id: string,
    updateBrandDto: UpdateBrandDto,
    ctx: RequestContextDto,
  ): Promise<BrandEntity> {
    this.logger.log(`${this.updateBrand.name} Service Called`)
    const tenantId = ctx.tenantId
    const brand = await this.findOneBrand(id, ctx)

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existing = await this.brandRepo.findBySlug(updateBrandDto.slug, tenantId)

      if (existing) {
        throw new ConflictException('Brand with this slug already exists')
      }
    }

    const result = await this.brandRepo.updateAndSave(brand, updateBrandDto)
    await this.cache.delCache(`brands:list`, tenantId)
    await this.cache.delCache(`brands:stats`, tenantId)
    return result
  }

  async removeBrand(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeBrand.name} Service Called`)
    const tenantId = ctx.tenantId
    const brand = await this.findOneBrand(id, ctx)
    await this.brandRepo.removeBrand(brand)
    await this.cache.delCache(`brands:list`, tenantId)
    await this.cache.delCache(`brands:stats`, tenantId)
    return { success: true, message: 'Brand deleted successfully' }
  }
}
