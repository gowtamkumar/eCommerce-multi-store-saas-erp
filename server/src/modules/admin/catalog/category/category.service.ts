import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CategoryRepository } from './category.repository'
import { CategoryEntity } from './entities/category.entity'

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly cache: CacheService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    ctx: RequestContextDto,
  ): Promise<CategoryEntity> {
    this.logger.log(`${this.createCategory.name} Service Called`)
    const tenantId = ctx.tenantId
    const existing = await this.categoryRepo.findBySlug(createCategoryDto.slug, tenantId)

    if (existing) {
      throw new ConflictException('Category with this slug already exists')
    }

    const result = await this.categoryRepo.createAndSave(createCategoryDto, ctx)
    await this.cache.delCache(`categories:list`, tenantId)
    await this.cache.delCache(`categories:stats`, tenantId)
    return result
  }

  async findAllCategories(ctx: RequestContextDto): Promise<CategoryEntity[]> {
    this.logger.log(`${this.findAllCategories.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `categories:list`

    // If the request does not contain a tenant (e.g., super‑admin UI), fall back to
    // returning all categories across tenants. This prevents a TypeORM error caused
    // by querying with an undefined UUID.
    const fetchFn = async () => {
      if (tenantId) {
        return this.categoryRepo.findAllByTenant(tenantId)
      }
      // No tenant – return all categories (ordered by name) without a tenant filter.
      return this.categoryRepo.findAll()
    }

    return this.cache.rememberCache(cacheKey, fetchFn, 600, tenantId)
  }

  async findAllCategoriesWithStats(ctx: RequestContextDto) {
    this.logger.log(`${this.findAllCategoriesWithStats.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `categories:stats`

    const fetchFn = async () => {
      if (tenantId) {
        const results = await this.categoryRepo.findAllWithProductCounts(tenantId)
        return results.map((r) => ({
          ...r,
          productCount: Number(r.productCount || 0),
        }))
      }
      // No tenant – compute stats for all categories.
      const qb = await this.categoryRepo.getAllCategoriesQueryBuilder()
      const results = await qb
        .select([
          'category.id as id',
          'category.name as name',
          'category.slug as slug',
          'category.description as description',
          'category.image as image',
          'category.createdAt as "createdAt"',
        ])
        .addSelect(
          (sub) =>
            sub
              .select('COUNT(p.id)', 'count')
              .from('products', 'p')
              .where('p.categoryId = category.id')
              .andWhere('p.deletedAt IS NULL'),
          'productCount',
        )
        .orderBy('category.name', 'ASC')
        .getRawMany()
      return results.map((r) => ({
        ...r,
        productCount: Number(r.productCount || 0),
      }))
    }

    return this.cache.rememberCache(cacheKey, fetchFn, 600, tenantId)
  }

  async findOneCategory(id: string, ctx: RequestContextDto): Promise<CategoryEntity> {
    this.logger.log(`${this.findOneCategory.name} Service Called`)
    const tenantId = ctx.tenantId
    const category = await this.categoryRepo.findById(id, tenantId)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return category
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    ctx: RequestContextDto,
  ): Promise<CategoryEntity> {
    this.logger.log(`${this.updateCategory.name} Service Called`)
    const tenantId = ctx.tenantId
    const category = await this.findOneCategory(id, ctx)

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepo.findBySlug(updateCategoryDto.slug, tenantId)

      if (existing) {
        throw new ConflictException('Category with this slug already exists')
      }
    }

    const result = await this.categoryRepo.updateAndSave(category, updateCategoryDto)
    await this.cache.delCache(`categories:list`, tenantId)
    await this.cache.delCache(`categories:stats`, tenantId)
    return result
  }

  async removeCategory(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeCategory.name} Service Called`)
    const tenantId = ctx.tenantId
    const category = await this.findOneCategory(id, ctx)
    await this.categoryRepo.removeCategory(category)
    await this.cache.delCache(`categories:list`, tenantId)
    await this.cache.delCache(`categories:stats`, tenantId)
    return { success: true, message: 'Category deleted successfully' }
  }
}
