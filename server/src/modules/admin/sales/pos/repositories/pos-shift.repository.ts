import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { PosShiftEntity, PosShiftStatus } from '../entities/pos-shift.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PosShiftRepository {
  constructor(
    @InjectRepository(PosShiftEntity)
    private readonly repo: Repository<PosShiftEntity>,
  ) {}

  async findAll(tenantId: string): Promise<PosShiftEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['register', 'user'],
      order: { openingTime: 'DESC' },
    })
  }

  async findOne(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<PosShiftEntity | null> {
    const repository = manager ? manager.getRepository(PosShiftEntity) : this.repo
    return repository.findOne({
      where: { id, tenantId },
      relations: ['register', 'user'],
    })
  }

  async findActiveShiftForUser(userId: string, tenantId: string): Promise<PosShiftEntity | null> {
    return this.repo.findOne({
      where: { userId, tenantId, status: PosShiftStatus.OPEN },
      relations: ['register'],
    })
  }

  async create(
    data: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<PosShiftEntity> {
    const repository = manager ? manager.getRepository(PosShiftEntity) : this.repo
    const shift = repository.create({
      ...data,
      tenantId: ctx.tenantId,
    })
    return repository.save(shift) as any
  }

  async update(shift: PosShiftEntity, data: any, manager?: EntityManager): Promise<PosShiftEntity> {
    const repository = manager ? manager.getRepository(PosShiftEntity) : this.repo
    Object.assign(shift, data)
    return repository.save(shift) as any
  }
}
