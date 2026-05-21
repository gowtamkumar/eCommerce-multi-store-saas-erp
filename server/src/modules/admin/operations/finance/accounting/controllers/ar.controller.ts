import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common'
import { ArService } from '../services/ar.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/finance')
@Controller('finance/ar')
export class ArController {
  constructor(private readonly arService: ArService) {}

  @Get('aging')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getAgingReport(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.arService.getArAgingReport(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Accounts Receivable aging report generated successfully',
      data,
    }
  }

  @Get('customer/:customerId')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getCustomerLedger(
    @Param('customerId') customerId: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.arService.getCustomerLedger(customerId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer AR ledger retrieved successfully',
      data,
    }
  }

  @Post('payment')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async recordPayment(
    @Body()
    body: {
      customerId: string
      amount: number
      paymentMethod: string
      transactionId: string
      remarks?: string
    },
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.arService.recordCustomerPayment(body, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer debt payment recorded successfully',
      data,
    }
  }
}
