import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ProductVariantEntity } from './entities/variant.entity'

@Injectable()
export class ProductVariantRepository extends Repository<ProductVariantEntity> {
  constructor(private dataSource: DataSource) {
    super(ProductVariantEntity, dataSource.createEntityManager())
  }
}
