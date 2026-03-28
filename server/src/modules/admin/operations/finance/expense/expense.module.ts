import { Module } from '@nestjs/common'
import { ExpenseController } from './expense.controller'
import { ExpenseRepository } from './expense.repository'
import { ExpenseService } from './expense.service'

@Module({
  imports: [],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
