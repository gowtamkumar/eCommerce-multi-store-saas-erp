import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseService } from './expense.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
    constructor(private readonly expenseService: ExpenseService) { }

    @Post()
    createExpense(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
        return this.expenseService.createExpense(createExpenseDto, req.user.tenantId);
    }

    @Get()
    findAllExpenses(@Request() req: any) {
        return this.expenseService.findAllExpenses(req.user.tenantId);
    }

    @Get(':id')
    findOneExpense(@Param('id') id: string, @Request() req: any) {
        return this.expenseService.findOneExpense(id, req.user.tenantId);
    }

    @Patch(':id')
    updateExpense(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Request() req: any) {
        return this.expenseService.updateExpense(id, updateExpenseDto, req.user.tenantId);
    }

    @Delete(':id')
    removeExpense(@Param('id') id: string, @Request() req: any) {
        return this.expenseService.removeExpense(id, req.user.tenantId);
    }
}
