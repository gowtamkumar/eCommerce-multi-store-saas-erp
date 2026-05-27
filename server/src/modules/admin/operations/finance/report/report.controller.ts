import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { BranchScopeGuard } from '@/common/guards/branch-scope.guard'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Controller, Get, Logger, Param, Query, UseGuards } from '@nestjs/common'
import { ReportService } from './report.service'

@Controller('report')
@UseGuards(JwtAuthGuard, SubscriptionGuard, BranchScopeGuard)
@RequireFeature('reports')
export class ReportController {
  private readonly logger = new Logger(ReportController.name)
  constructor(private readonly reportService: ReportService) {}

  @Get('/analytics')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getAnalytics(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getAnalytics.`)
    const result = await this.reportService.getAnalytics(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Analytics retrieved successfully',
      data: result,
    }
  }

  @Get('/dashboard')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getDashboardReport(
    @RequestContext() ctx: RequestContextDto,
    @Query('period') period: string = 'month',
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getDashboardReport.`)
    const result = await this.reportService.getDashboardReport(ctx, period)
    return {
      success: true,
      statusCode: 200,
      message: 'Dashboard report retrieved',
      data: result,
    }
  }

  @Get('/profit-loss')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getProfitLossReport(
    @RequestContext() ctx: RequestContextDto,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getProfitLossReport.`)
    const result = await this.reportService.getProfitLossReport(ctx, startDateStr, endDateStr)
    return {
      success: true,
      statusCode: 200,
      message: 'Profit and loss report retrieved',
      data: result,
    }
  }

  @Get('/supplier-ledger/:supplierId')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getSupplierLedger(
    @RequestContext() ctx: RequestContextDto,
    @Param('supplierId') supplierId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getSupplierLedger.`)
    const result = await this.reportService.getSupplierLedger(ctx, supplierId)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier ledger retrieved',
      data: result,
    }
  }

  @Get('/customer-ledger/:customerId')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getCustomerLedger(
    @RequestContext() ctx: RequestContextDto,
    @Param('customerId') customerId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCustomerLedger.`)
    const result = await this.reportService.getCustomerLedger(ctx, customerId)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer ledger retrieved',
      data: result,
    }
  }

  @Get('/cash-flow')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getCashFlow(
    @RequestContext() ctx: RequestContextDto,
    @Query('period') period: string = 'last30days',
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCashFlow.`)
    const result = await this.reportService.getCashFlow(ctx, period)
    return {
      success: true,
      statusCode: 200,
      message: 'Cash flow report retrieved',
      data: result,
    }
  }

  @Get('/export/:type')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async exportReport(
    @RequestContext() ctx: RequestContextDto,
    @Param('type') type: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('supplierId') supplierId?: string,
    @Query('customerId') customerId?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called exportReport.`)
    const result = await this.reportService.exportReport(
      ctx,
      type,
      startDateStr,
      endDateStr,
      supplierId,
      customerId,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Report exported successfully',
      data: result,
    }
  }

  @Get('/finance-summary')
  @RequirePermissions(SystemPermissions.REPORTS_READ)
  async getFinanceSummary(
    @RequestContext() ctx: RequestContextDto,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getFinanceSummary.`)
    const result = await this.reportService.getFinanceSummary(ctx, startDateStr, endDateStr)
    return {
      success: true,
      statusCode: 200,
      message: 'Finance summary retrieved',
      data: result,
    }
  }
}
