import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateBranchDto, UpdateBranchDto } from '../dto/branch.dto'
import { BranchEntity } from '../entities/branch.entity'
import { BranchRepository } from '../repositories/branch.repository'

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  async findAll(ctx: RequestContextDto): Promise<BranchEntity[]> {
    return this.branchRepository.findAll(ctx.tenantId)
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<BranchEntity> {
    const branch = await this.branchRepository.findOne(id, ctx.tenantId)
    if (!branch) {
      throw new NotFoundException('Branch not found')
    }
    return branch
  }

  async create(createBranchDto: CreateBranchDto, ctx: RequestContextDto): Promise<BranchEntity> {
    const existing = await this.branchRepository.findByCode(createBranchDto.code, ctx.tenantId)
    if (existing) {
      throw new ConflictException('Branch code already exists')
    }
    return this.branchRepository.create(createBranchDto, ctx)
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, ctx: RequestContextDto): Promise<BranchEntity> {
    const branch = await this.findOne(id, ctx)
    if (updateBranchDto.code && updateBranchDto.code !== branch.code) {
      const existing = await this.branchRepository.findByCode(updateBranchDto.code, ctx.tenantId)
      if (existing) {
        throw new ConflictException('Branch code already exists')
      }
    }
    return this.branchRepository.update(branch, updateBranchDto)
  }

  async remove(id: string, ctx: RequestContextDto): Promise<void> {
    const branch = await this.findOne(id, ctx)
    await this.branchRepository.remove(branch)
  }
}
