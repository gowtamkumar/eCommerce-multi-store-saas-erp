import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductAttributeEntity } from '../entities/attribute.entity'

@Injectable()
export class ProductAttributeRepository {
  constructor(
    @InjectRepository(ProductAttributeEntity)
    private readonly repo: Repository<ProductAttributeEntity>,
  ) { }

  async saveMultiple(
    attributes: any[],
    productId: string,
    tenantId: string,
    manager?: any,
  ): Promise<ProductAttributeEntity[]> {
    if (!attributes || attributes.length === 0) return []
    const repo = manager ? manager.getRepository(ProductAttributeEntity) : this.repo
    const entities = attributes.map((attr) =>
      repo.create({ ...attr, productId, tenantId } as ProductAttributeEntity),
    )
    return repo.save(entities)
  }

  async deleteByProductId(productId: string, tenantId: string, manager?: any): Promise<void> {
    const repo = manager ? manager.getRepository(ProductAttributeEntity) : this.repo
    await repo.softDelete({ productId, tenantId })
  }

}
