import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FaqEntity } from './entities/faq.entity'

@Injectable()
export class FaqRepository extends Repository<FaqEntity> {
  constructor(private dataSource: DataSource) {
    super(FaqEntity, dataSource.createEntityManager())
  }
}
