import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ReportService } from './report.service'

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/analytics')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async getAnalytics(@Request() req: any) {
    return this.reportService.getAnalytics(req.user.tenantId)
  }

  @Get('/dashboard')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async getDashboardReport(@Request() req: any, @Query('period') period: string = 'month') {
    return this.reportService.getDashboardReport(req.user.tenantId, period)
  }

  @Get('/profit-loss')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async getProfitLossReport(
    @Request() req: any,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    return this.reportService.getProfitLossReport(req.user.tenantId, startDateStr, endDateStr)
  }

  @Get('/supplier-ledger/:supplierId')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async getSupplierLedger(@Request() req: any, @Param('supplierId') supplierId: string) {
    return this.reportService.getSupplierLedger(req.user.tenantId, supplierId)
  }

  @Get('/customer-ledger/:customerId')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async getCustomerLedger(@Request() req: any, @Param('customerId') customerId: string) {
    return this.reportService.getCustomerLedger(req.user.tenantId, customerId)
  }

  @Get('/cash-flow')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async getCashFlow(@Request() req: any, @Query('period') period: string = 'last30days') {
    return this.reportService.getCashFlow(req.user.tenantId, period)
  }

  @Get('/export/:type')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async exportReport(
    @Request() req: any,
    @Param('type') type: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('supplierId') supplierId?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.reportService.exportReport(
      req.user.tenantId,
      type,
      startDateStr,
      endDateStr,
      supplierId,
      customerId,
    )
  }

  @Get('/finance-summary')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async getFinanceSummary(@Request() req: any) {
    return this.reportService.getFinanceSummary(req.user.tenantId)
  }
}
