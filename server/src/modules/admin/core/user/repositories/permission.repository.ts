import { BaseStoreRepository } from '@/common/base-repository'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class PermissionRepository extends BaseStoreRepository<PermissionEntity> {
  constructor(
    @InjectRepository(PermissionEntity)
    repo: Repository<PermissionEntity>,
  ) {
    super(PermissionEntity, repo)
  }

  create(data: DeepPartial<PermissionEntity>): PermissionEntity {
    return this.repo.create(data)
  }

  async save(permission: PermissionEntity): Promise<PermissionEntity> {
    return this.repo.save(permission)
  }

  async find(options?: FindManyOptions<PermissionEntity>): Promise<PermissionEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<PermissionEntity>): Promise<PermissionEntity | null> {
    return this.repo.findOne(options)
  }
}
