import { getTransactionalRepo } from '@/common/utils/repository.util'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductAttributeEntity } from '../entities/attribute.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ProductAttributeRepository {
  constructor(
    @InjectRepository(ProductAttributeEntity)
    private readonly repo: Repository<ProductAttributeEntity>,
  ) {}

  async saveMultiple(
    attributes: any[],
    productId: string,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<ProductAttributeEntity[]> {
    if (!attributes || attributes.length === 0) return []
    const repo = getTransactionalRepo(ProductAttributeEntity, this.repo, manager)
    const entities = attributes.map((attr) =>
      repo.create({
        ...attr,
        productId,
        tenantId: ctx.tenantId,
        userId: ctx.userId,
      } as ProductAttributeEntity),
    )
    return repo.save(entities)
  }

  async deleteByProductId(productId: string, tenantId: string, manager?: any): Promise<void> {
    const repo = getTransactionalRepo(ProductAttributeEntity, this.repo, manager)
    await repo.softDelete({ productId, tenantId })
  }
}
