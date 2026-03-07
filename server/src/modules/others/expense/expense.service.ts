import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseEntity } from './entities/expense.entity';

@Injectable()
export class ExpenseService {
    private readonly logger = new Logger(ExpenseService.name);

    constructor(
        @InjectRepository(ExpenseEntity)
        private expenseRepository: Repository<ExpenseEntity>,
    ) { }

    async createExpense(createExpenseDto: CreateExpenseDto, tenantId: string) {
        this.logger.log(`${this.createExpense.name} Service Called`);
        const expense = this.expenseRepository.create({
            ...createExpenseDto,
            tenantId,
        });

        return await this.expenseRepository.save(expense);
    }

    async findAllExpenses(tenantId: string) {
        this.logger.log(`${this.findAllExpenses.name} Service Called`);
        return await this.expenseRepository.find({
            where: { tenantId },
            order: { expenseDate: 'DESC', createdAt: 'DESC' },
        });
    }

    async findOneExpense(id: string, tenantId: string) {
        this.logger.log(`${this.findOneExpense.name} Service Called`);
        const expense = await this.expenseRepository.findOne({
            where: { id, tenantId },
        });

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }

        return expense;
    }

    async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, tenantId: string) {
        this.logger.log(`${this.updateExpense.name} Service Called`);
        const expense = await this.findOneExpense(id, tenantId);

        Object.assign(expense, updateExpenseDto);

        return await this.expenseRepository.save(expense);
    }

    async removeExpense(id: string, tenantId: string) {
        this.logger.log(`${this.removeExpense.name} Service Called`);
        const expense = await this.findOneExpense(id, tenantId);
        return await this.expenseRepository.remove(expense);
    }
}
