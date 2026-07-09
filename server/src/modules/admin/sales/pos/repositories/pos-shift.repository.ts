import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { PosShiftEntity, PosShiftStatus } from '../entities/pos-shift.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PosShiftRepository extends BaseStoreRepository<PosShiftEntity> {
  constructor(
    @InjectRepository(PosShiftEntity)
    repo: Repository<PosShiftEntity>,
  ) {
    super(PosShiftEntity, repo)
}

  async findAll(storeId: string, branchId?: string): Promise<PosShiftEntity[]> {
    const where: any = { storeId }
    if (branchId) {
      where.branchId = branchId
    }
    return this.repo.find({
      where,
      relations: {
        register: true,
        user: true,
      },
      order: { openingTime: 'DESC' },
    })
  }

  async findOne(
    id: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<PosShiftEntity | null> {
    const repository = this.txRepo(manager)
    return repository.findOne({
      where: { id, storeId },
      relations: {
        register: true,
        user: true,
      },
    })
  }

  async findActiveShiftForUser(userId: string, storeId: string): Promise<PosShiftEntity | null> {
    return this.repo.findOne({
      where: { userId, storeId, status: PosShiftStatus.OPEN },
      relations: {
        register: true,
      },
    })
  }

  async create(
    data: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<PosShiftEntity> {
    const repository = this.txRepo(manager)
    const shift = repository.create({
      ...data,
      storeId: ctx.storeId,
    })
    return repository.save(shift) as any
  }

  async update(shift: PosShiftEntity, data: any, manager?: EntityManager): Promise<PosShiftEntity> {
    const repository = this.txRepo(manager)
    Object.assign(shift, data)
    return repository.save(shift) as any
  }
}
