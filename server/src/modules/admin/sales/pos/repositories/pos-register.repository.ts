import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PosRegisterEntity } from '../entities/pos-register.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PosRegisterRepository {
  constructor(
    @InjectRepository(PosRegisterEntity)
    private readonly repo: Repository<PosRegisterEntity>,
  ) {}

  async findAll(tenantId: string): Promise<PosRegisterEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: {
        branch: true,
      },
    })
  }

  async findOne(id: string, tenantId: string): Promise<PosRegisterEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: {
        branch: true,
      },
    })
  }

  async create(data: any, ctx: RequestContextDto): Promise<PosRegisterEntity> {
    const register = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
    })
    return this.repo.save(register) as any
  }

  async update(register: PosRegisterEntity, data: any): Promise<PosRegisterEntity> {
    Object.assign(register, data)
    return this.repo.save(register) as any
  }

  async remove(register: PosRegisterEntity): Promise<void> {
    await this.repo.softRemove(register)
  }
}
