import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExpenseEntity } from './entities/expense.entity'

@Injectable()
export class ExpenseRepository {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly repo: Repository<ExpenseEntity>,
  ) { }

  async createAndSave(dto: any, tenantId: string): Promise<ExpenseEntity> {
    const expense = this.repo.create({ ...dto, tenantId } as ExpenseEntity)
    return this.repo.save(expense)
  }

  async findAllOrdered(tenantId: string): Promise<ExpenseEntity[]> {
    return this.repo.find({
      where: { tenantId },
      order: { expenseDate: 'DESC', createdAt: 'DESC' },
    })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<ExpenseEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
    })
  }

  async updateAndSave(expense: ExpenseEntity, dto: any): Promise<ExpenseEntity> {
    Object.assign(expense, dto)
    return this.repo.save(expense)
  }

  async removeExpense(expense: ExpenseEntity): Promise<ExpenseEntity> {
    return this.repo.softRemove(expense)
  }
}
