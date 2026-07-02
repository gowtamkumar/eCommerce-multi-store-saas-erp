import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductEntity } from '../product/entities/product.entity'
import { CategoryEntity } from './entities/category.entity'

@Injectable()
export class CategoryRepository extends BaseStoreRepository<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    repo: Repository<CategoryEntity>,
  ) {
    super(CategoryEntity, repo)
  }

  async findBySlug(slug: string, storeId: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { slug, storeId } })
  }

  async findById(id: string, storeId: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async findAllByStore(storeId: string): Promise<CategoryEntity[]> {
    return this.repo.find({
      where: { storeId },
      order: { name: 'ASC' },
    })
  }

  /**
   * Retrieve all categories across stores. Used by super‑admin UI where no store
   * context is available. This method bypasses the private `repo` property restriction
   * by exposing a public accessor.
   */
  async findAll(): Promise<CategoryEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } })
  }

  /**
   * Expose a query builder for categories without store filtering.
   * Used by the service when computing stats for all stores.
   */
  getAllCategoriesQueryBuilder() {
    return this.repo.createQueryBuilder('category')
  }

  async findAllWithProductCounts(storeId: string) {
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
          .andWhere('p.storeId = :storeId', { storeId })
      }, 'productCount')
      .where('category.storeId = :storeId', { storeId })
      .orderBy('category.name', 'ASC')
      .getRawMany()
  }

  async createAndSave(
    data: Partial<CategoryEntity>,
    ctx: RequestContextDto,
  ): Promise<CategoryEntity> {
    const category = this.repo.create({
      ...data,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as CategoryEntity)
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
