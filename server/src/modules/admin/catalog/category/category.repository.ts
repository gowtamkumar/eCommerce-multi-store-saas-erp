import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoryEntity } from './entities/category.entity'
import { ProductEntity } from '../product/entities/product.entity'

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) { }

  async findBySlug(slug: string, tenantId: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { slug, tenantId } })
  }

  async findById(id: string, tenantId: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async findAllByTenant(tenantId: string): Promise<CategoryEntity[]> {
    return this.repo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async findAllWithProductCounts(tenantId: string) {
    return this.repo
      .createQueryBuilder('category')
      .select([
        'category.id as id',
        'category.name as name',
        'category.slug as slug',
        'category.description as description',
        'category.image as image',
        'category.createdAt as "createdAt"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(p.id)', 'count')
          .from(ProductEntity, 'p')
          .where('p.categoryId = category.id')
          .andWhere('p.deletedAt IS NULL')
          .andWhere('p.tenantId = :tenantId', { tenantId })
      }, 'productCount')
      .where('category.tenantId = :tenantId', { tenantId })
      .orderBy('category.name', 'ASC')
      .getRawMany()
  }

  async createAndSave(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const category = this.repo.create(data as CategoryEntity)
    return this.repo.save(category)
  }

  async updateAndSave(
    category: CategoryEntity,
    data: Partial<CategoryEntity>,
  ): Promise<CategoryEntity> {
    Object.assign(category, data)
    return this.repo.save(category)
  }

  async removeCategory(category: CategoryEntity): Promise<void> {
    await this.repo.softRemove(category)
  }

}
