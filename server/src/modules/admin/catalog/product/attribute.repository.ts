import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ProductAttributeEntity } from './entities/attribute.entity'

@Injectable()
export class ProductAttributeRepository extends Repository<ProductAttributeEntity> {
  constructor(private dataSource: DataSource) {
    super(ProductAttributeEntity, dataSource.createEntityManager())
  }
}
