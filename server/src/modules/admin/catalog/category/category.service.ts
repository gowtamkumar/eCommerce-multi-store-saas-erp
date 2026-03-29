import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CategoryRepository } from './category.repository'
import { CategoryEntity } from './entities/category.entity'

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)

  constructor(private readonly categoryRepo: CategoryRepository) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    tenantId: string,
  ): Promise<CategoryEntity> {
    this.logger.log(`${this.createCategory.name} Service Called`)
    const existing = await this.categoryRepo.findBySlug(createCategoryDto.slug, tenantId)

    if (existing) {
      throw new ConflictException('Category with this slug already exists')
    }

    return await this.categoryRepo.createAndSave({
      ...createCategoryDto,
      tenantId,
    })
  }

  async findAllCategories(tenantId: string): Promise<CategoryEntity[]> {
    this.logger.log(`${this.findAllCategories.name} Service Called`)
    return await this.categoryRepo.findAllByTenant(tenantId)
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

    return await this.categoryRepo.updateAndSave(category, updateCategoryDto)
  }

  async removeCategory(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeCategory.name} Service Called`)
    const category = await this.findOneCategory(id, tenantId)
    await this.categoryRepo.removeCategory(category)
    return { success: true, message: 'Category deleted successfully' }
  }
}
