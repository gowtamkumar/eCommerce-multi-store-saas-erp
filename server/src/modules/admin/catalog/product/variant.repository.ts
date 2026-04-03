import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductVariantEntity } from './entities/variant.entity'

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private readonly repo: Repository<ProductVariantEntity>,
  ) { }

  async findCombinationsForProducts(tenantId: string, categoryId?: string) {
    const variantQuery = this.repo.createQueryBuilder('variant')
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

  async saveNewVariant(
    variantDto: any,
    productId: string,
    tenantId: string,
  ): Promise<ProductVariantEntity> {
    const variant = this.repo.create({
      ...variantDto,
      productId,
      tenantId,
      stock: 0,
    } as ProductVariantEntity)
    return this.repo.save(variant)
  }

  async saveExistingVariant(
    variantDto: any,
    productId: string,
    tenantId: string,
  ): Promise<ProductVariantEntity> {
    const variant = this.repo.create({
      ...variantDto,
      productId,
      tenantId,
    } as ProductVariantEntity)
    return this.repo.save(variant)
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (ids.length > 0) {
      await this.repo.softDelete(ids)
    }
  }

  async incrementStock(
    id: string,
    tenantId: string,
    quantity: number,
    manager?: any,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(ProductVariantEntity) : this.repo
    await repo.increment({ id, tenantId }, 'stock', quantity)
  }

  async decrementStock(
    id: string,
    tenantId: string,
    quantity: number,
    manager?: any,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(ProductVariantEntity) : this.repo
    await repo.decrement({ id, tenantId }, 'stock', quantity)
  }

}
