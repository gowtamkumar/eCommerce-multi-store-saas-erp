import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
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
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/expenses')
export class ExpenseController {
  private readonly logger = new Logger(ExpenseController.name)

  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ExpenseResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createExpense.`)
    const result = await this.expenseService.createExpense(createExpenseDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Expense created successfully',
      data: result,
    }
  }

  @Get()
  async findAllExpenses(
    @RequestContext() ctx: RequestContextDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllExpenses.`)
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
  async findOneExpense(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ExpenseResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneExpense.`)
    const result = await this.expenseService.findOneExpense(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense retrieved',
      data: result,
    }
  }

  @Patch(':id')
  async updateExpense(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ExpenseResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateExpense.`)
    const result = await this.expenseService.updateExpense(id, updateExpenseDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  async removeExpense(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeExpense.`)
    await this.expenseService.removeExpense(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense deleted successfully',
      data: null,
    }
  }
}
