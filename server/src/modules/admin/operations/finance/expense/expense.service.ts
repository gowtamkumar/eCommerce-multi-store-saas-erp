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

import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)

  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
  ) {}

  async createExpense(
    createExpenseDto: CreateExpenseDto,
    ctx: RequestContextDto,
  ): Promise<ExpenseEntity> {
    this.logger.log(`${this.createExpense.name} Service Called`)
    const tenantId = ctx.tenantId
    const result = await this.expenseRepository.createAndSave(createExpenseDto, ctx)
    
    // Trigger High Expense Warning
    try {
      const EXPENSE_THRESHOLD = 1000;
      if (createExpenseDto.amount > EXPENSE_THRESHOLD) {
        await this.notificationService.createNotification({
          title: 'High Expense Recorded',
          message: `A new expense "${createExpenseDto.title}" for ${createExpenseDto.amount} requires review.`,
          type: 'WARNING',
          link: '/admin/finance/expenses',
          userId: null as any, // Tenant-wide admin notification
        }, tenantId);
      }
    } catch (e) {
      this.logger.error(`Failed to trigger high expense notification: ${e.message}`)
    }

    // Invalidate list cache on creation
    await Promise.all([
      this.cacheService.delCacheByPattern('expenses:list*', tenantId),
      this.cacheService.delCacheByPattern('expenses:raw*', tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
      this.cacheService.delCacheByPattern('pnl*', tenantId),
      this.cacheService.delCacheByPattern('cashflow*', tenantId),
      this.cacheService.delCacheByPattern('finance:summary*', tenantId),
    ])
    return result
  }

  /**
   * Paginated, server-side filtered expense listing.
   * Cached per page/filter combination to minimize DB hits.
   */
  async findAllExpenses(
    ctx: RequestContextDto,
    options: FindAllOptions = {},
  ): Promise<{
    items: ExpenseEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    this.logger.log(`${this.findAllExpenses.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, category, q, startDate, endDate } = options
    const branchId = ctx.branchId
    const cacheKey = `expenses:list:p${page}:l${limit}:cat${category || 'all'}:q${q || ''}:s${startDate?.getTime()}:e${endDate?.getTime()}:b${branchId || 'global'}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.expenseRepository.findAllPaginated(tenantId, { ...options, branchId })
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
  async findAllExpensesRaw(
    ctx: RequestContextDto,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExpenseEntity[]> {
    this.logger.log(`${this.findAllExpensesRaw.name} Service Called`)
    const tenantId = ctx.tenantId
    const branchId = ctx.branchId
    const cacheKey = `expenses:raw:${startDate?.getTime()}:${endDate?.getTime()}:b${branchId || 'global'}`
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.expenseRepository.findAllRaw(tenantId, startDate, endDate, branchId),
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

  async updateExpense(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    ctx: RequestContextDto,
  ): Promise<ExpenseEntity> {
    this.logger.log(`${this.updateExpense.name} Service Called`)
    const tenantId = ctx.tenantId
    const expense = await this.expenseRepository.findByIdAndTenant(id, tenantId)
    if (!expense) throw new NotFoundException('Expense not found')

    const result = await this.expenseRepository.updateAndSave(expense, updateExpenseDto)
    // Invalidate both list and individual caches
    await Promise.all([
      this.cacheService.delCacheByPattern('expenses:list*', tenantId),
      this.cacheService.delCacheByPattern('expenses:raw*', tenantId),
      this.cacheService.delCache(`expenses:id:${id}`, tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
      this.cacheService.delCacheByPattern('pnl*', tenantId),
      this.cacheService.delCacheByPattern('cashflow*', tenantId),
      this.cacheService.delCacheByPattern('finance:summary*', tenantId),
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
      this.cacheService.delCacheByPattern('expenses:list*', tenantId),
      this.cacheService.delCacheByPattern('expenses:raw*', tenantId),
      this.cacheService.delCache(`expenses:id:${id}`, tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
      this.cacheService.delCacheByPattern('pnl*', tenantId),
      this.cacheService.delCacheByPattern('cashflow*', tenantId),
      this.cacheService.delCacheByPattern('finance:summary*', tenantId),
    ])
    return result
  }
}
