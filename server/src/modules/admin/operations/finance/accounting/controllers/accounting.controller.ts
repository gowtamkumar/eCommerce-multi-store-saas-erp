import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Controller, Get, Post, Put, Delete, UseGuards, Body, Param } from '@nestjs/common'
import { AccountingService } from '../services/accounting.service'
import { FinancialReportService } from '../services/financial-report.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'
import { FiscalPeriodStatus } from '../entities/fiscal-period.entity'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('finance/accounting')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly reportService: FinancialReportService,
  ) { }

  @Post('init')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async initialize(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<void>> {
    await this.accountingService.initializeTenantCOA(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Chart of Accounts initialized successfully',
      data: null,
    }
  }

  // Account Endpoints
  @Get('accounts')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getAccounts(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.accountingService.getAccounts(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Accounts retrieved successfully',
      data,
    }
  }

  @Post('accounts')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async createAccount(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { code: string; name: string; type: AccountType; category: AccountCategory },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.accountingService.createAccount(body, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Account created successfully',
      data,
    }
  }

  @Put('accounts/:id')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async updateAccount(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { name: string; type: AccountType; category: AccountCategory },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.accountingService.updateAccount(id, body, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Account updated successfully',
      data,
    }
  }

  @Delete('accounts/:id')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async deleteAccount(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<void>> {
    await this.accountingService.deleteAccount(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Account deleted successfully',
      data: null,
    }
  }

  // Fiscal Period Endpoints
  @Get('fiscal-periods')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getFiscalPeriods(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.accountingService.getFiscalPeriods(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Fiscal periods retrieved successfully',
      data,
    }
  }

  @Post('fiscal-periods')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async createFiscalPeriod(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { name: string; startDate: string; endDate: string },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.accountingService.createFiscalPeriod(body, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Fiscal period created successfully',
      data,
    }
  }

  @Put('fiscal-periods/:id/status')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async setFiscalPeriodStatus(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { status: FiscalPeriodStatus },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.accountingService.setFiscalPeriodStatus(id, body.status, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Fiscal period status updated successfully',
      data,
    }
  }

  // Reports
  @Get('reports/profit-loss')
  @RequireFeature('/admin/finance/profit-loss')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getPL(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.reportService.getProfitAndLoss(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Profit and Loss report generated successfully',
      data,
    }
  }

  @Get('reports/balance-sheet')
  @RequireFeature('/admin/finance/balance-sheet')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getBalanceSheet(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.reportService.getBalanceSheet(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Balance sheet report generated successfully',
      data,
    }
  }

  @Get('reports/cash-flow')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getCashFlow(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.reportService.getCashFlowStatement(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Cash flow report generated successfully',
      data,
    }
  }

  @Post('journal-entries/:id/reverse')
  @RequireFeature('/admin/finance')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async reverseJournalEntry(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.accountingService.reverseJournalEntry(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Journal entry reversed successfully',
      data,
    }
  }
}

