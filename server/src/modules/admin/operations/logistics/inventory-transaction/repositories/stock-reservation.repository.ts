import { BaseStoreRepository } from '@/common/base-repository'
import { StockReservationEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-reservation.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class StockReservationRepository extends BaseStoreRepository<StockReservationEntity> {
  constructor(
    @InjectRepository(StockReservationEntity)
    repo: Repository<StockReservationEntity>,
  ) {
    super(StockReservationEntity, repo)
  }

  create(data: DeepPartial<StockReservationEntity>): StockReservationEntity {
    return this.repo.create(data)
  }

  async save(entity: StockReservationEntity): Promise<StockReservationEntity> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<StockReservationEntity>): Promise<StockReservationEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<StockReservationEntity>): Promise<StockReservationEntity | null> {
    return this.repo.findOne(options)
  }
}
