import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { CategoryEntity } from './entities/category.entity'

@Injectable()
export class CategoryRepository extends Repository<CategoryEntity> {
  constructor(private dataSource: DataSource) {
    super(CategoryEntity, dataSource.createEntityManager())
  }

  async findBySlug(slug: string, tenantId: string): Promise<CategoryEntity | null> {
    return this.findOne({ where: { slug, tenantId } })
  }

  async findById(id: string, tenantId: string): Promise<CategoryEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async findAllByTenant(tenantId: string): Promise<CategoryEntity[]> {
    return this.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async createAndSave(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const category = this.create(data as CategoryEntity)
    return this.save(category)
  }

  async updateAndSave(
    category: CategoryEntity,
    data: Partial<CategoryEntity>,
  ): Promise<CategoryEntity> {
    Object.assign(category, data)
    return this.save(category)
  }

  async removeCategory(category: CategoryEntity): Promise<void> {
    await this.remove(category)
  }
}
