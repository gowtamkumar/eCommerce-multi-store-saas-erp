import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CategoryRepository } from './category.repository'
import { CategoryEntity } from './entities/category.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly cache: CacheService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    tenantId: string,
  ): Promise<CategoryEntity> {
    this.logger.log(`${this.createCategory.name} Service Called`)
    const existing = await this.categoryRepo.findBySlug(createCategoryDto.slug, tenantId)

    if (existing) {
      throw new ConflictException('Category with this slug already exists')
    }

    const result = await this.categoryRepo.createAndSave({
      ...createCategoryDto,
      tenantId,
    })
    await this.cache.delCache(`categories:list`, tenantId)
    await this.cache.delCache(`categories:stats`, tenantId)
    return result
  }

  async findAllCategories(tenantId: string): Promise<CategoryEntity[]> {
    this.logger.log(`${this.findAllCategories.name} Service Called`)
    const cacheKey = `categories:list`
    
    return this.cache.rememberCache(
      cacheKey,
      () => this.categoryRepo.findAllByTenant(tenantId),
      600, // 10 minutes
      tenantId
    )
  }

  async findAllCategoriesWithStats(tenantId: string) {
    this.logger.log(`${this.findAllCategoriesWithStats.name} Service Called`)
    const cacheKey = `categories:stats`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const results = await this.categoryRepo.findAllWithProductCounts(tenantId)
        return results.map(r => ({
          ...r,
          productCount: Number(r.productCount || 0)
        }))
      },
      600, // 10 minutes
      tenantId
    )
  }

  async findOneCategory(id: string, tenantId: string): Promise<CategoryEntity> {
    this.logger.log(`${this.findOneCategory.name} Service Called`)
    const category = await this.categoryRepo.findById(id, tenantId)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return category
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    tenantId: string,
  ): Promise<CategoryEntity> {
    this.logger.log(`${this.updateCategory.name} Service Called`)
    const category = await this.findOneCategory(id, tenantId)

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
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeCategory.name} Service Called`)
    const category = await this.findOneCategory(id, tenantId)
    await this.categoryRepo.removeCategory(category)
    await this.cache.delCache(`categories:list`, tenantId)
    await this.cache.delCache(`categories:stats`, tenantId)
    return { success: true, message: 'Category deleted successfully' }
  }
}
