import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExpenseEntity } from './entities/expense.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

interface FindAllOptions {
  page?: number
  limit?: number
  category?: string
  q?: string
  startDate?: Date
  endDate?: Date
  branchId?: string
}

@Injectable()
export class ExpenseRepository extends BaseStoreRepository<ExpenseEntity> {
  constructor(
    @InjectRepository(ExpenseEntity)
    repo: Repository<ExpenseEntity>,
  ) {
    super(ExpenseEntity, repo)
}

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<ExpenseEntity> {
    const expense = this.repo.create({
      ...dto,
      branchId: dto.branchId || ctx.branchId || null,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as ExpenseEntity)
    return this.repo.save(expense)
  }

  /**
   * Paginated, filterable query with QueryBuilder.
   * Replaces the unbounded `find()` call to prevent memory exhaustion.
   */
  async findAllPaginated(
    storeId: string,
    options: FindAllOptions = {},
  ): Promise<[ExpenseEntity[], number]> {
    const { page = 1, limit = 20, category, q, startDate, endDate, branchId } = options

    const qb = this.repo
      .createQueryBuilder('expense')
      .where('expense.storeId = :storeId', { storeId })
      .orderBy('expense.expenseDate', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)

    if (branchId) {
      qb.andWhere('expense.branchId = :branchId', { branchId })
    }

    if (category) {
      qb.andWhere('expense.category = :category', { category })
    }

    if (startDate) {
      qb.andWhere('expense.expenseDate >= :startDate', { startDate })
    }

    if (endDate) {
      qb.andWhere('expense.expenseDate <= :endDate', { endDate })
    }

    if (q) {
      qb.andWhere('(LOWER(expense.title) LIKE :q OR LOWER(expense.referenceNumber) LIKE :q)', {
        q: `%${q.toLowerCase()}%`,
      })
    }

    return qb.getManyAndCount()
  }

  /**
   * Raw (unpaginated) fetch for internal reporting use only.
   * NOT exposed via the public API.
   */
  async findAllRaw(
    storeId: string,
    startDate?: Date,
    endDate?: Date,
    branchId?: string,
  ): Promise<ExpenseEntity[]> {
    const qb = this.repo
      .createQueryBuilder('expense')
      .where('expense.storeId = :storeId', { storeId })
      .orderBy('expense.expenseDate', 'DESC')

    if (branchId) {
      qb.andWhere('expense.branchId = :branchId', { branchId })
    }

    if (startDate) {
      qb.andWhere('expense.expenseDate >= :startDate', { startDate })
    }

    if (endDate) {
      qb.andWhere('expense.expenseDate <= :endDate', { endDate })
    }

    return qb.getMany()
  }

  async findByIdAndStore(id: string, storeId: string): Promise<ExpenseEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async updateAndSave(expense: ExpenseEntity, dto: any): Promise<ExpenseEntity> {
    Object.assign(expense, dto)
    return this.repo.save(expense)
  }

  async removeExpense(expense: ExpenseEntity): Promise<ExpenseEntity> {
    return this.repo.softRemove(expense)
  }
}
