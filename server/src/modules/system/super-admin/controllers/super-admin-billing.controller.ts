import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { SuperAdminService } from '../super-admin.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminBillingController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('/billing/overview')
  async getBillingOverview(): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getBillingOverview()
    return {
      success: true,
      statusCode: 200,
      message: 'Billing overview retrieved successfully',
      data,
    }
  }

  @Get('/billing/invoices')
  async getAllInvoices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getAllInvoices(page, limit, status, search)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoices retrieved successfully',
      data,
    }
  }

  @Get('/billing/revenue-chart')
  async getRevenueChart(@Query('months') months?: number): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getRevenueChart(months)
    return {
      success: true,
      statusCode: 200,
      message: 'Revenue chart data retrieved',
      data,
    }
  }

  @Get('/billing/churn')
  async getChurnAnalytics(): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.superAdminService.getChurnAnalytics()
    return {
      success: true,
      statusCode: 200,
      message: 'Churned merchants retrieved successfully',
      data,
    }
  }

  @Get('/billing/invoices/export')
  async exportInvoicesCSV(@Res() res: Response): Promise<void> {
    const invoices = await this.superAdminService.getInvoicesForExport()

    const rows = [
      ['Invoice #', 'Tenant', 'Plan', 'Amount', 'Currency', 'Status', 'Billing Cycle', 'Date'].join(
        ',',
      ),
      ...invoices.map((inv) =>
        [
          inv.invoiceNumber,
          `"${(inv.tenant?.storeName || '').replace(/"/g, '""')}"`,
          inv.subscriptionPlan?.name || '',
          inv.amount,
          inv.currency,
          inv.status,
          inv.billingCycle,
          inv.billingDate ? new Date(inv.billingDate).toISOString() : '',
        ].join(','),
      ),
    ]

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="invoices-${Date.now()}.csv"`)
    res.send(rows.join('\n'))
  }
}
