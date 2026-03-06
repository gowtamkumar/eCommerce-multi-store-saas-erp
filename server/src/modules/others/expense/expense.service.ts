import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
    constructor(
        @InjectRepository(ExpenseEntity)
        private expenseRepository: Repository<ExpenseEntity>,
    ) { }

    async create(createExpenseDto: CreateExpenseDto, tenantId: string) {
        const expense = this.expenseRepository.create({
            ...createExpenseDto,
            tenantId,
        });

        return await this.expenseRepository.save(expense);
    }

    async findAll(tenantId: string) {
        return await this.expenseRepository.find({
            where: { tenantId },
            order: { expenseDate: 'DESC', createdAt: 'DESC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const expense = await this.expenseRepository.findOne({
            where: { id, tenantId },
        });

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }

        return expense;
    }

    async update(id: string, updateExpenseDto: UpdateExpenseDto, tenantId: string) {
        const expense = await this.findOne(id, tenantId);

        Object.assign(expense, updateExpenseDto);

        return await this.expenseRepository.save(expense);
    }

    async remove(id: string, tenantId: string) {
        const expense = await this.findOne(id, tenantId);
        return await this.expenseRepository.remove(expense);
    }
}
