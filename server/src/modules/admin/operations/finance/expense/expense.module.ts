import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExpenseService } from './expense.service'
import { ExpenseController } from './expense.controller'
import { ExpenseEntity } from './entities/expense.entity'
import { ExpenseRepository } from './expense.repository'

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseEntity])],
  controllers: [ExpenseController],
  providers: [ExpenseService, ExpenseRepository],
  exports: [ExpenseService, ExpenseRepository],
})
export class ExpenseModule {}
