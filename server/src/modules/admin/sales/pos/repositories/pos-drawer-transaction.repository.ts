import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { PosDrawerTransactionEntity } from '../entities/pos-drawer-transaction.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PosDrawerTransactionRepository extends BaseTenantRepository<PosDrawerTransactionEntity> {
  constructor(
    @InjectRepository(PosDrawerTransactionEntity)
    repo: Repository<PosDrawerTransactionEntity>,
  ) {
    super(PosDrawerTransactionEntity, repo)
}

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
    const repository = this.txRepo(manager)
    const tx = repository.create({
      ...data,
      tenantId: ctx.tenantId,
    })
    return repository.save(tx) as any
  }
}
