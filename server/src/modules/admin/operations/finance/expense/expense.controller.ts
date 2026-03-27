import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ExpenseService } from './expense.service'

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
    return this.expenseService.createExpense(createExpenseDto, req.user.tenantId)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR)
  findAllExpenses(@Request() req: any) {
    return this.expenseService.findAllExpenses(req.user.tenantId)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR)
  findOneExpense(@Param('id') id: string, @Request() req: any) {
    return this.expenseService.findOneExpense(id, req.user.tenantId)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  updateExpense(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req: any,
  ) {
    return this.expenseService.updateExpense(id, updateExpenseDto, req.user.tenantId)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  removeExpense(@Param('id') id: string, @Request() req: any) {
    return this.expenseService.removeExpense(id, req.user.tenantId)
  }
}
