import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ExpenseEntity } from './entities/expense.entity'

@Injectable()
export class ExpenseRepository extends Repository<ExpenseEntity> {
  constructor(private dataSource: DataSource) {
    super(ExpenseEntity, dataSource.createEntityManager())
  }

  async createAndSave(dto: any, tenantId: string): Promise<ExpenseEntity> {
    const expense = this.create({ ...dto, tenantId } as ExpenseEntity)
    return this.save(expense)
  }

  async findAllOrdered(tenantId: string): Promise<ExpenseEntity[]> {
    return this.find({
      where: { tenantId },
      order: { expenseDate: 'DESC', createdAt: 'DESC' },
    })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<ExpenseEntity | null> {
    return this.findOne({
      where: { id, tenantId },
    })
  }

  async updateAndSave(expense: ExpenseEntity, dto: any): Promise<ExpenseEntity> {
    Object.assign(expense, dto)
    return this.save(expense)
  }

  async removeExpense(expense: ExpenseEntity): Promise<ExpenseEntity> {
    return this.softRemove(expense)
  }
}
