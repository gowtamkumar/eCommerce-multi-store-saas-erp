import { BaseStoreRepository } from '@/common/base-repository'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class UserPermissionOverrideRepository extends BaseStoreRepository<UserPermissionOverrideEntity> {
  constructor(
    @InjectRepository(UserPermissionOverrideEntity)
    repo: Repository<UserPermissionOverrideEntity>,
  ) {
    super(UserPermissionOverrideEntity, repo)
  }

  create(data: DeepPartial<UserPermissionOverrideEntity>): UserPermissionOverrideEntity {
    return this.repo.create(data)
  }

  async save(override: UserPermissionOverrideEntity): Promise<UserPermissionOverrideEntity> {
    return this.repo.save(override)
  }

  async find(options?: FindManyOptions<UserPermissionOverrideEntity>): Promise<UserPermissionOverrideEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<UserPermissionOverrideEntity>): Promise<UserPermissionOverrideEntity | null> {
    return this.repo.findOne(options)
  }

  async remove(override: UserPermissionOverrideEntity): Promise<UserPermissionOverrideEntity> {
    return this.repo.remove(override)
  }
}
