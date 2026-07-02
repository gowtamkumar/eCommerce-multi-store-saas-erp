import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductAttributeEntity } from '../entities/attribute.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ProductAttributeRepository extends BaseStoreRepository<ProductAttributeEntity> {
  constructor(
    @InjectRepository(ProductAttributeEntity)
    repo: Repository<ProductAttributeEntity>,
  ) {
    super(ProductAttributeEntity, repo)
  }

  async saveMultiple(
    attributes: any[],
    productId: string,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<ProductAttributeEntity[]> {
    if (!attributes || attributes.length === 0) return []
    const repo = this.txRepo(manager)
    const entities = attributes.map((attr) =>
      repo.create({
        ...attr,
        productId,
        storeId: ctx.storeId,
        userId: ctx.userId,
      } as ProductAttributeEntity),
    )
    return repo.save(entities)
  }

  async deleteByProductId(productId: string, storeId: string, manager?: any): Promise<void> {
    const repo = this.txRepo(manager)
    await repo.softDelete({ productId, storeId })
  }
}
