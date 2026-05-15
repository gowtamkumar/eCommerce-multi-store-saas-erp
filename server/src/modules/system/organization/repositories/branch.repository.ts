import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BranchEntity } from '../entities/branch.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class BranchRepository {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly repo: Repository<BranchEntity>,
  ) { }

  async findAll(tenantId: string): Promise<BranchEntity[]> {
    return this.repo.find({ where: { tenantId } })
  }

  async findOne(id: string, tenantId: string): Promise<BranchEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async create(data: any, ctx: RequestContextDto): Promise<BranchEntity> {
    const branch = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
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

  async findByCode(code: string, tenantId: string): Promise<BranchEntity | null> {
    return this.repo.findOne({ where: { code, tenantId } })
  }
}
