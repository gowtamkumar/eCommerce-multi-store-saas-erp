import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ProductAttributeEntity } from './entities/attribute.entity'

@Injectable()
export class ProductAttributeRepository extends Repository<ProductAttributeEntity> {
  constructor(private dataSource: DataSource) {
    super(ProductAttributeEntity, dataSource.createEntityManager())
  }

  async saveMultiple(
    attributes: any[],
    productId: string,
    tenantId: string,
  ): Promise<ProductAttributeEntity[]> {
    if (!attributes || attributes.length === 0) return []
    const entities = attributes.map((attr) =>
      this.create({ ...attr, productId, tenantId } as ProductAttributeEntity),
    )
    return this.save(entities)
  }

  async deleteByProductId(productId: string, tenantId: string): Promise<void> {
    await this.delete({ productId, tenantId })
  }
}
