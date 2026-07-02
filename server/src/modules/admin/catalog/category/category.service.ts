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
    const storeId = ctx.storeId
    const existing = await this.categoryRepo.findBySlug(createCategoryDto.slug, storeId)

    if (existing) {
      throw new ConflictException('Category with this slug already exists')
    }

    const result = await this.categoryRepo.createAndSave(createCategoryDto, ctx)
    await this.cache.delCache(`categories:list`, storeId)
    await this.cache.delCache(`categories:stats`, storeId)
    return result
  }

  async findAllCategories(ctx: RequestContextDto): Promise<CategoryEntity[]> {
    this.logger.log(`${this.findAllCategories.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `categories:list`

    // If the request does not contain a store (e.g., super‑admin UI), fall back to
    // returning all categories across stores. This prevents a TypeORM error caused
    // by querying with an undefined UUID.
    const fetchFn = async () => {
      if (storeId) {
        return this.categoryRepo.findAllByStore(storeId)
      }
      // No store – return all categories (ordered by name) without a store filter.
      return this.categoryRepo.findAll()
    }

    return this.cache.rememberCache(cacheKey, fetchFn, 600, storeId)
  }

  async findAllCategoriesWithStats(ctx: RequestContextDto) {
    this.logger.log(`${this.findAllCategoriesWithStats.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `categories:stats`

    const fetchFn = async () => {
      if (storeId) {
        const results = await this.categoryRepo.findAllWithProductCounts(storeId)
        return results.map((r) => ({
          ...r,
          productCount: Number(r.productCount || 0),
        }))
      }
      // No store – compute stats for all categories.
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

    return this.cache.rememberCache(cacheKey, fetchFn, 600, storeId)
  }

  async findOneCategory(id: string, ctx: RequestContextDto): Promise<CategoryEntity> {
    this.logger.log(`${this.findOneCategory.name} Service Called`)
    const storeId = ctx.storeId
    const category = await this.categoryRepo.findById(id, storeId)

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
    const storeId = ctx.storeId
    const category = await this.findOneCategory(id, ctx)

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepo.findBySlug(updateCategoryDto.slug, storeId)

      if (existing) {
        throw new ConflictException('Category with this slug already exists')
      }
    }

    const result = await this.categoryRepo.updateAndSave(category, updateCategoryDto)
    await this.cache.delCache(`categories:list`, storeId)
    await this.cache.delCache(`categories:stats`, storeId)
    return result
  }

  async removeCategory(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeCategory.name} Service Called`)
    const storeId = ctx.storeId
    const category = await this.findOneCategory(id, ctx)
    await this.categoryRepo.removeCategory(category)
    await this.cache.delCache(`categories:list`, storeId)
    await this.cache.delCache(`categories:stats`, storeId)
    return { success: true, message: 'Category deleted successfully' }
  }
}
