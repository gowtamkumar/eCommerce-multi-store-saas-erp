import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExpenseEntity } from './entities/expense.entity'

interface FindAllOptions {
  page?: number
  limit?: number
  category?: string
  q?: string
  startDate?: Date
  endDate?: Date
}

@Injectable()
export class ExpenseRepository {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly repo: Repository<ExpenseEntity>,
  ) {}

  async createAndSave(dto: any, tenantId: string): Promise<ExpenseEntity> {
    const expense = this.repo.create({ ...dto, tenantId } as ExpenseEntity)
    return this.repo.save(expense)
  }

  /**
   * Paginated, filterable query with QueryBuilder.
   * Replaces the unbounded `find()` call to prevent memory exhaustion.
   */
  async findAllPaginated(
    tenantId: string,
    options: FindAllOptions = {},
  ): Promise<[ExpenseEntity[], number]> {
    const { page = 1, limit = 20, category, q, startDate, endDate } = options

    const qb = this.repo
      .createQueryBuilder('expense')
      .where('expense.tenantId = :tenantId', { tenantId })
      .orderBy('expense.expenseDate', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)

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
      qb.andWhere(
        '(LOWER(expense.title) LIKE :q OR LOWER(expense.referenceNumber) LIKE :q)',
        { q: `%${q.toLowerCase()}%` },
      )
    }

    return qb.getManyAndCount()
  }

  /**
   * Raw (unpaginated) fetch for internal reporting use only.
   * NOT exposed via the public API.
   */
  async findAllRaw(tenantId: string, startDate?: Date, endDate?: Date): Promise<ExpenseEntity[]> {
    const qb = this.repo
      .createQueryBuilder('expense')
      .where('expense.tenantId = :tenantId', { tenantId })
      .orderBy('expense.expenseDate', 'DESC')

    if (startDate) {
      qb.andWhere('expense.expenseDate >= :startDate', { startDate })
    }

    if (endDate) {
      qb.andWhere('expense.expenseDate <= :endDate', { endDate })
    }

    return qb.getMany()
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<ExpenseEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async updateAndSave(expense: ExpenseEntity, dto: any): Promise<ExpenseEntity> {
    Object.assign(expense, dto)
    return this.repo.save(expense)
  }

  async removeExpense(expense: ExpenseEntity): Promise<ExpenseEntity> {
    return this.repo.softRemove(expense)
  }
}
