import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ExpenseRepository } from './expense.repository'
import { ExpenseEntity } from './entities/expense.entity'

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)

  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async createExpense(createExpenseDto: CreateExpenseDto, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.createExpense.name} Service Called`)
    return await this.expenseRepository.createAndSave(createExpenseDto, tenantId)
  }

  async findAllExpenses(tenantId: string): Promise<ExpenseEntity[]> {
    this.logger.log(`${this.findAllExpenses.name} Service Called`)
    return await this.expenseRepository.findAllOrdered(tenantId)
  }

  async findOneExpense(id: string, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.findOneExpense.name} Service Called`)
    const expense = await this.expenseRepository.findByIdAndTenant(id, tenantId)

    if (!expense) {
      throw new NotFoundException('Expense not found')
    }

    return expense
  }

  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.updateExpense.name} Service Called`)
    const expense = await this.findOneExpense(id, tenantId)
    return await this.expenseRepository.updateAndSave(expense, updateExpenseDto)
  }

  async removeExpense(id: string, tenantId: string): Promise<ExpenseEntity> {
    this.logger.log(`${this.removeExpense.name} Service Called`)
    const expense = await this.findOneExpense(id, tenantId)
    return await this.expenseRepository.removeExpense(expense)
  }
}
