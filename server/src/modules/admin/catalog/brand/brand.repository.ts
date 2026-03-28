import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { BrandEntity } from './entities/brand.entity'

@Injectable()
export class BrandRepository extends Repository<BrandEntity> {
  constructor(private dataSource: DataSource) {
    super(BrandEntity, dataSource.createEntityManager())
  }

  // Custom repository methods can be added here
}
