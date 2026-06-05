import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { PosDrawerTransactionEntity } from '../entities/pos-drawer-transaction.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { getTransactionalRepo } from '@/common/utils/repository.util'

@Injectable()
export class PosDrawerTransactionRepository {
  constructor(
    @InjectRepository(PosDrawerTransactionEntity)
    private readonly repo: Repository<PosDrawerTransactionEntity>,
  ) {}

  async findAllForShift(shiftId: string, tenantId: string): Promise<PosDrawerTransactionEntity[]> {
    return this.repo.find({
      where: { shiftId, tenantId },
      relations: {
        user: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async create(
    data: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<PosDrawerTransactionEntity> {
    const repository = getTransactionalRepo(PosDrawerTransactionEntity, this.repo, manager)
    const tx = repository.create({
      ...data,
      tenantId: ctx.tenantId,
    })
    return repository.save(tx) as any
  }
}
