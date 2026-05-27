import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common'
import { ArService } from '../services/ar.service'
import { DunningService } from '../services/dunning.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('finance')
@Controller('finance/ar')
export class ArController {
  constructor(
    private readonly arService: ArService,
    private readonly dunningService: DunningService,
  ) {}

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

  // --- Dunning Rules Endpoints ---

  @Get('dunning/rules')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getDunningRules(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.dunningService.findAllRules(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Dunning rules retrieved successfully',
      data,
    }
  }

  @Post('dunning/rules')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async createDunningRule(
    @Body() body: any,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.dunningService.createRule(body, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Dunning rule created successfully',
      data,
    }
  }

  @Put('dunning/rules/:id')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async updateDunningRule(
    @Param('id') id: string,
    @Body() body: any,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.dunningService.updateRule(id, body, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Dunning rule updated successfully',
      data,
    }
  }

  @Delete('dunning/rules/:id')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async deleteDunningRule(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.dunningService.deleteRule(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Dunning rule deleted successfully',
      data: null,
    }
  }

  // --- Dunning Logs Endpoints ---

  @Get('dunning/logs')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getDunningLogs(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.dunningService.findAllLogs(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Dunning logs retrieved successfully',
      data,
    }
  }

  // --- Run Dunning Sweep ---

  @Post('dunning/run-audit')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async runDunningAudit(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.dunningService.runDunningAudit(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Dunning audit completed successfully',
      data,
    }
  }
}

