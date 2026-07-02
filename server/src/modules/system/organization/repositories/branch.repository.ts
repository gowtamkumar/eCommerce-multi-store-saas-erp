import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BranchEntity } from '../entities/branch.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class BranchRepository extends BaseStoreRepository<BranchEntity> {
  constructor(
    @InjectRepository(BranchEntity)
    repo: Repository<BranchEntity>,
  ) {
    super(BranchEntity, repo)
}

  async findAll(storeId: string): Promise<BranchEntity[]> {
    return this.repo.find({ where: { storeId } })
  }

  async findOne(id: string, storeId: string): Promise<BranchEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async create(data: any, ctx: RequestContextDto): Promise<BranchEntity> {
    const branch = this.repo.create({
      ...data,
      storeId: ctx.storeId,
      userId: ctx.userId,
    })
    return this.repo.save(branch) as unknown as Promise<BranchEntity>
  }

  async update(branch: BranchEntity, data: any): Promise<BranchEntity> {
    Object.assign(branch, data)
    return this.repo.save(branch) as unknown as Promise<BranchEntity>
  }

  async remove(branch: BranchEntity): Promise<void> {
    await this.repo.softRemove(branch)
  }

  async findByCode(code: string, storeId: string): Promise<BranchEntity | null> {
    return this.repo.findOne({ where: { code, storeId } })
  }
}
