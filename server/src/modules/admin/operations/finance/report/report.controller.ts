import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ReportService } from './report.service'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/analytics')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async getAnalytics(
    @Request() req: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getAnalytics(req.user.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Analytics retrieved successfully',
      data: result,
    }
  }

  @Get('/dashboard')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async getDashboardReport(
    @Request() req: any,
    @Query('period') period: string = 'month',
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getDashboardReport(req.user.tenantId, period)
    return {
      success: true,
      statusCode: 200,
      message: 'Dashboard report retrieved',
      data: result,
    }
  }

  @Get('/profit-loss')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async getProfitLossReport(
    @Request() req: any,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getProfitLossReport(req.user.tenantId, startDateStr, endDateStr)
    return {
      success: true,
      statusCode: 200,
      message: 'Profit and loss report retrieved',
      data: result,
    }
  }

  @Get('/supplier-ledger/:supplierId')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async getSupplierLedger(
    @Request() req: any,
    @Param('supplierId') supplierId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getSupplierLedger(req.user.tenantId, supplierId)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier ledger retrieved',
      data: result,
    }
  }

  @Get('/customer-ledger/:customerId')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async getCustomerLedger(
    @Request() req: any,
    @Param('customerId') customerId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getCustomerLedger(req.user.tenantId, customerId)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer ledger retrieved',
      data: result,
    }
  }

  @Get('/cash-flow')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async getCashFlow(
    @Request() req: any,
    @Query('period') period: string = 'last30days',
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getCashFlow(req.user.tenantId, period)
    return {
      success: true,
      statusCode: 200,
      message: 'Cash flow report retrieved',
      data: result,
    }
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
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.exportReport(
      req.user.tenantId,
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
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async getFinanceSummary(
    @Request() req: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.reportService.getFinanceSummary(req.user.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Finance summary retrieved',
      data: result,
    }
  }
}
