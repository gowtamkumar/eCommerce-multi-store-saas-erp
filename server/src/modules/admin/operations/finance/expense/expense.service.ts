import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ExpenseEntity } from './entities/expense.entity'
import { ExpenseRepository } from './expense.repository'

interface FindAllOptions {
  page?: number
  limit?: number
  category?: string
  q?: string
  startDate?: Date
  endDate?: Date
}

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)

  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createExpense(createExpenseDto: CreateExpenseDto, ctx: RequestContextDto): Promise<ExpenseEntity> {
    this.logger.log(`${this.createExpense.name} Service Called`)
    const tenantId = ctx.tenantId
    const result = await this.expenseRepository.createAndSave(createExpenseDto, tenantId, ctx.userId)
    // Invalidate list cache on creation
    await this.cacheService.delCache('expenses:list', tenantId)
    return result
  }

  /**
   * Paginated, server-side filtered expense listing.
   * Cached per page/filter combination to minimize DB hits.
   */
  async findAllExpenses(
    ctx: RequestContextDto,
    options: FindAllOptions = {},
  ): Promise<{ items: ExpenseEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`${this.findAllExpenses.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, category, q, startDate, endDate } = options
    const cacheKey = `expenses:list:p${page}:l${limit}:cat${category || 'all'}:q${q || ''}:s${startDate?.getTime()}:e${endDate?.getTime()}`

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
  async findAllExpensesRaw(ctx: RequestContextDto, startDate?: Date, endDate?: Date): Promise<ExpenseEntity[]> {
    this.logger.log(`${this.findAllExpensesRaw.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `expenses:raw:${startDate?.getTime()}:${endDate?.getTime()}`
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.expenseRepository.findAllRaw(tenantId, startDate, endDate),
      300,
      tenantId,
    )
  }

  async findOneExpense(id: string, ctx: RequestContextDto): Promise<ExpenseEntity> {
    this.logger.log(`${this.findOneExpense.name} Service Called`)
    const tenantId = ctx.tenantId
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

  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, ctx: RequestContextDto): Promise<ExpenseEntity> {
    this.logger.log(`${this.updateExpense.name} Service Called`)
    const tenantId = ctx.tenantId
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

  async removeExpense(id: string, ctx: RequestContextDto): Promise<ExpenseEntity> {
    this.logger.log(`${this.removeExpense.name} Service Called`)
    const tenantId = ctx.tenantId
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
