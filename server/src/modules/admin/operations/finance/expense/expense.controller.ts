import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { ExpenseResponseDto } from './dto/expense-response.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ExpenseService } from './expense.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async createExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ExpenseResponseDto>> {
    const result = await this.expenseService.createExpense(createExpenseDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Expense created successfully',
      data: result,
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR)
  async findAllExpenses(
    @RequestContext() ctx: RequestContextDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.expenseService.findAllExpenses(ctx, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      category,
      q,
    })
    return {
      success: true,
      statusCode: 200,
      message: 'Expenses retrieved',
      data: result,
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR)
  async findOneExpense(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ExpenseResponseDto>> {
    const result = await this.expenseService.findOneExpense(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense retrieved',
      data: result,
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updateExpense(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ExpenseResponseDto>> {
    const result = await this.expenseService.updateExpense(id, updateExpenseDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removeExpense(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.expenseService.removeExpense(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense deleted successfully',
      data: null,
    }
  }
}
