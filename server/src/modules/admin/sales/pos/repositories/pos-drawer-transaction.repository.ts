import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { PosDrawerTransactionEntity } from '../entities/pos-drawer-transaction.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PosDrawerTransactionRepository extends BaseStoreRepository<PosDrawerTransactionEntity> {
  constructor(
    @InjectRepository(PosDrawerTransactionEntity)
    repo: Repository<PosDrawerTransactionEntity>,
  ) {
    super(PosDrawerTransactionEntity, repo)
}

  async findAllForShift(shiftId: string, storeId: string): Promise<PosDrawerTransactionEntity[]> {
    return this.repo.find({
      where: { shiftId, storeId },
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
      storeId: ctx.storeId,
    })
    return repository.save(tx) as any
  }
}
