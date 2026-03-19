import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ExpenseEntity } from './entities/expense.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ExpenseEntity])],
    controllers: [ExpenseController],
    providers: [ExpenseService],
    exports: [ExpenseService],
})
export class ExpenseModule { }
