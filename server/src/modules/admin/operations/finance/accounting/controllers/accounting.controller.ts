import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AccountingService } from '../services/accounting.service'
import { FinancialReportService } from '../services/financial-report.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('finance/accounting')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly reportService: FinancialReportService,
  ) {}

  @Post('init')
  @RequireFeature('/admin/finance')
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

  @Get('reports/profit-loss')
  @RequireFeature('/admin/finance/profit-loss')
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
}
