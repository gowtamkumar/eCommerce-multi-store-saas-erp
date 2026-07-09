import { BaseStoreRepository } from '@/common/base-repository'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class UserRoleAssignmentRepository extends BaseStoreRepository<UserRoleAssignmentEntity> {
  constructor(
    @InjectRepository(UserRoleAssignmentEntity)
    repo: Repository<UserRoleAssignmentEntity>,
  ) {
    super(UserRoleAssignmentEntity, repo)
  }

  create(data: DeepPartial<UserRoleAssignmentEntity>): UserRoleAssignmentEntity {
    return this.repo.create(data)
  }

  async save(assignment: UserRoleAssignmentEntity): Promise<UserRoleAssignmentEntity> {
    return this.repo.save(assignment)
  }

  async find(options?: FindManyOptions<UserRoleAssignmentEntity>): Promise<UserRoleAssignmentEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<UserRoleAssignmentEntity>): Promise<UserRoleAssignmentEntity | null> {
    return this.repo.findOne(options)
  }

  async count(options?: FindManyOptions<UserRoleAssignmentEntity>): Promise<number> {
    return this.repo.count(options)
  }

  async remove(assignment: UserRoleAssignmentEntity): Promise<UserRoleAssignmentEntity> {
    return this.repo.remove(assignment)
  }
}
