import { getTransactionalRepo } from '@/common/utils/repository.util'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { ProductVariantEntity } from '../entities/variant.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private readonly repo: Repository<ProductVariantEntity>,
  ) {}

  async findCombinationsForProducts(tenantId: string, categoryId?: string) {
    const variantQuery = this.repo
      .createQueryBuilder('variant')
      .innerJoin('variant.product', 'product')
      .where('variant.tenantId = :tenantId', { tenantId })
      .select('variant.combination', 'combination')

    if (categoryId) {
      variantQuery.andWhere('product.categoryId = :categoryId', { categoryId })
    }
    return variantQuery.getRawMany()
  }

  async findByProductId(productId: string, tenantId: string): Promise<ProductVariantEntity[]> {
    return this.repo.find({ where: { productId, tenantId } })
  }

  async findById(
    id: string,
    tenantId: string,
    manager?: any,
  ): Promise<ProductVariantEntity | null> {
    const repo = getTransactionalRepo(ProductVariantEntity, this.repo, manager)
    return repo.findOne({ where: { id, tenantId } })
  }

  async saveNewVariant(
    variantDto: any,
    productId: string,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<ProductVariantEntity> {
    const repo = getTransactionalRepo(ProductVariantEntity, this.repo, manager)
    const variant = repo.create({
      ...variantDto,
      productId,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      stock: 0,
    } as ProductVariantEntity)
    return repo.save(variant)
  }

  async saveExistingVariant(
    variantDto: any,
    productId: string,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<ProductVariantEntity> {
    const repo = getTransactionalRepo(ProductVariantEntity, this.repo, manager)

    // ERP FIX: Never update stock via the product edit form.
    const { stock, ...updateData } = variantDto

    const variant = repo.create({
      ...updateData,
      productId,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as ProductVariantEntity)
    return repo.save(variant)
  }

  async updateAverageCost(
    id: string,
    tenantId: string,
    newCost: number,
    manager?: any,
  ): Promise<void> {
    const repo = getTransactionalRepo(ProductVariantEntity, this.repo, manager)
    await repo.update({ id, tenantId }, { averageCost: newCost })
  }

  async findBySku(
    sku: string,
    tenantId: string,
    manager?: any,
    withDeleted: boolean = false,
  ): Promise<ProductVariantEntity | null> {
    const repo = getTransactionalRepo(ProductVariantEntity, this.repo, manager)
    return repo.findOne({ where: { sku, tenantId }, withDeleted })
  }

  async deleteByIds(ids: string[], manager?: any): Promise<void> {
    if (ids.length > 0) {
      const repo = getTransactionalRepo(ProductVariantEntity, this.repo, manager)
      await repo.softDelete(ids)
    }
  }
}
