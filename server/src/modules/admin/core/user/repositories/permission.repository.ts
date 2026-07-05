import { BaseStoreRepository } from '@/common/base-repository'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'

@Injectable()
export class PermissionRepository extends BaseStoreRepository<PermissionEntity> {
  constructor(
    @InjectRepository(PermissionEntity)
    repo: Repository<PermissionEntity>,
  ) {
    super(PermissionEntity, repo)
  }

  async find(options?: FindManyOptions<PermissionEntity>): Promise<PermissionEntity[]> {
    return this.repo.find(options)
  }
}
