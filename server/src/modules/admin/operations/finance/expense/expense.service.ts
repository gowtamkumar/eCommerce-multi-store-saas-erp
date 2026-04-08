import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ExpenseRepository } from './expense.repository'
import { ExpenseEntity } from './entities/expense.entity'

interface FindAllOptions {
  page?: number
  limit?: number
  category?: string
  q?: string
}

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)

  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createExpense(createExpenseDto: CreateExpenseDto, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.createExpense.name} Service Called`)
    const result = await this.expenseRepository.createAndSave(createExpenseDto, tenantId)
    // Invalidate list cache on creation
    await this.cacheService.delCache('expenses:list', tenantId)
    return result
  }

  /**
   * Paginated, server-side filtered expense listing.
   * Cached per page/filter combination to minimize DB hits.
   */
  async findAllExpenses(
    tenantId: string,
    options: FindAllOptions = {},
  ): Promise<{ items: ExpenseEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`${this.findAllExpenses.name} Service Called`)
    const { page = 1, limit = 20, category, q } = options
    const cacheKey = `expenses:list:p${page}:l${limit}:cat${category || 'all'}:q${q || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.expenseRepository.findAllPaginated(tenantId, options)
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300, // 5 min TTL
      tenantId,
    )
  }

  /**
   * Raw (unpaginated) fetch for internal use by `ReportService`.
   * Bypasses API-layer pagination.
   */
  async findAllExpensesRaw(tenantId: string): Promise<ExpenseEntity[]> {
    this.logger.log(`${this.findAllExpensesRaw.name} Service Called`)
    const cacheKey = 'expenses:raw'
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.expenseRepository.findAllRaw(tenantId),
      300,
      tenantId,
    )
  }

  async findOneExpense(id: string, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.findOneExpense.name} Service Called`)
    const cacheKey = `expenses:id:${id}`
    const expense = await this.cacheService.rememberCache(
      cacheKey,
      () => this.expenseRepository.findByIdAndTenant(id, tenantId),
      600, // 10 min TTL
      tenantId,
    )

    if (!expense) {
      throw new NotFoundException('Expense not found')
    }
    return expense
  }

  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.updateExpense.name} Service Called`)
    const expense = await this.expenseRepository.findByIdAndTenant(id, tenantId)
    if (!expense) throw new NotFoundException('Expense not found')

    const result = await this.expenseRepository.updateAndSave(expense, updateExpenseDto)
    // Invalidate both list and individual caches
    await Promise.all([
      this.cacheService.delCache('expenses:list', tenantId),
      this.cacheService.delCache(`expenses:id:${id}`, tenantId),
    ])
    return result
  }

  async removeExpense(id: string, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.removeExpense.name} Service Called`)
    const expense = await this.expenseRepository.findByIdAndTenant(id, tenantId)
    if (!expense) throw new NotFoundException('Expense not found')

    const result = await this.expenseRepository.removeExpense(expense)
    // Surgical cache invalidation
    await Promise.all([
      this.cacheService.delCache('expenses:list', tenantId),
      this.cacheService.delCache(`expenses:id:${id}`, tenantId),
    ])
    return result
  }
}
