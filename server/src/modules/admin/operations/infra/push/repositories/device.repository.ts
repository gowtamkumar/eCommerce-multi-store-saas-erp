import { BaseStoreRepository } from '@/common/base-repository'
import { DeviceEntity } from '@/modules/admin/operations/infra/push/entities/device.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class DeviceRepository extends BaseStoreRepository<DeviceEntity> {
  constructor(
    @InjectRepository(DeviceEntity)
    repo: Repository<DeviceEntity>,
  ) {
    super(DeviceEntity, repo)
  }

  create(data: DeepPartial<DeviceEntity>): DeviceEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<DeviceEntity>): Promise<DeviceEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<DeviceEntity>): Promise<DeviceEntity | null> {
    return this.repo.findOne(options)
  }

  async delete(criteria: any): Promise<void> {
    await this.repo.delete(criteria)
  }
}
