import { BaseStoreRepository } from '@/common/base-repository'
import { PriceBookEntity } from '@/modules/admin/catalog/pricing/entities/price-book.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class PriceBookRepository extends BaseStoreRepository<PriceBookEntity> {
  constructor(
    @InjectRepository(PriceBookEntity)
    repo: Repository<PriceBookEntity>,
  ) {
    super(PriceBookEntity, repo)
  }

  create(data: DeepPartial<PriceBookEntity>): PriceBookEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<PriceBookEntity>): Promise<PriceBookEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<PriceBookEntity>): Promise<PriceBookEntity | null> {
    return this.repo.findOne(options)
  }

  async remove(entity: PriceBookEntity): Promise<PriceBookEntity> {
    return this.repo.remove(entity)
  }
}
