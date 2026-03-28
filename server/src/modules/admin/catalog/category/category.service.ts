import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CategoryRepository } from './category.repository'

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)

  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto, tenantId: string) {
    this.logger.log(`${this.createCategory.name} Service Called`)
    const existing = await this.categoryRepo.findOne({
      where: { slug: createCategoryDto.slug, tenantId },
    })

    if (existing) {
      throw new ConflictException('Category with this slug already exists')
    }

    const category = this.categoryRepo.create({
      ...createCategoryDto,
      tenantId,
    })

    return await this.categoryRepo.save(category)
  }

  async findAllCategories(tenantId: string) {
    this.logger.log(`${this.findAllCategories.name} Service Called`)
    return await this.categoryRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async findOneCategory(id: string, tenantId: string) {
    this.logger.log(`${this.findOneCategory.name} Service Called`)
    const category = await this.categoryRepo.findOne({
      where: { id, tenantId },
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return category
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, tenantId: string) {
    this.logger.log(`${this.updateCategory.name} Service Called`)
    const category = await this.findOneCategory(id, tenantId)

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepo.findOne({
        where: { slug: updateCategoryDto.slug, tenantId },
      })

      if (existing) {
        throw new ConflictException('Category with this slug already exists')
      }
    }

    Object.assign(category, updateCategoryDto)
    return await this.categoryRepo.save(category)
  }

  async removeCategory(id: string, tenantId: string) {
    this.logger.log(`${this.removeCategory.name} Service Called`)
    const category = await this.findOneCategory(id, tenantId)
    await this.categoryRepo.remove(category)
    return { success: true, message: 'Category deleted successfully' }
  }
}
