import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Logger, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { Public } from '../../../common/decorators/public.decorator'
import { SubscriptionPlanEntity } from '../subscription-plan/entities/subscription-plan.entity'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { CurrentSubscriptionResponseDto } from './dto/current-subscription-response.dto'
import { SubscriptionInvoiceResponseDto } from './dto/subscription-invoice-response.dto'
import { SubscriptionBillingService } from './subscription-billing.service'

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class SubscriptionBillingController {
  private readonly logger = new Logger(SubscriptionBillingController.name)

  constructor(
    private readonly billingService: SubscriptionBillingService,
    private readonly configService: ConfigService,
  ) { }

  @Get('current')
  @PublicDuringExpiration()
  async getCurrentSubscription(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CurrentSubscriptionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCurrentSubscription.`)
    const data = await this.billingService.getCurrentSubscription(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Current subscription retrieved successfully',
      data,
    }
  }

  @Get('plans')
  @PublicDuringExpiration()
  async getAvailablePlans(): Promise<BaseApiSuccessResponse<SubscriptionPlanEntity[]>> {
    this.logger.verbose('called getAvailablePlans.')
    const data = await this.billingService.getAvailablePlans()
    return {
      success: true,
      statusCode: 200,
      message: 'Available subscription plans retrieved',
      data,
    }
  }

  @Get('history')
  @PublicDuringExpiration()
  async getBillingHistory(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SubscriptionInvoiceResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getBillingHistory.`)
    const data = await this.billingService.getBillingHistory(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Billing history retrieved successfully',
      data,
    }
  }

  @Post('initiate')
  @PublicDuringExpiration()
  async initiatePayment(
    @RequestContext() ctx: RequestContextDto,
    @Body('planId') planId: string,
    @Body('billingCycle') billingCycle: SubscriptionBillingCycle,
    @Body('frontendUrl') frontendUrl?: string,
  ): Promise<BaseApiSuccessResponse<{ gatewayUrl: string }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called initiatePayment.`)
    const data = await this.billingService.initiateSubscriptionPayment(ctx.tenantId, planId, billingCycle, frontendUrl, ctx.userId)
    return {
      success: true,
      statusCode: 200,
      message: 'Payment initiation successful',
      data,
    }
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/success')
  async completePaymentSuccess(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`Payment completion success callback for tran_id: ${tran_id}`)
    try {
      const data: any = await this.billingService.handleSuccessPayment(tran_id, body)
      return {
        success: true,
        statusCode: 200,
        message: 'Payment completed successfully',
        data: {
          id: data.id,
          invoiceNumber: data?.invoiceNumber,
          amount: data?.amount,
          status: data?.status,
          transactionId: data?.transactionId,
        },
      }
    } catch (error) {
      this.logger.error(`Error in completePaymentSuccess: ${error.message}`, error.stack)
      throw error
    }
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/fail')
  async completePaymentFail(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`Payment completion failure callback for tran_id: ${tran_id}`)
    try {
      const data: any = await this.billingService.handleFailPayment(tran_id, body)
      return {
        success: true,
        statusCode: 200,
        message: 'Payment failed processing',
        data: {
          id: data?.id,
          status: data?.status,
          transactionId: tran_id,
        },
      }
    } catch (error) {
      this.logger.error(`Error in completePaymentFail: ${error.message}`)
      return { success: false, statusCode: 500, message: 'Internal error during failure processing', data: { transactionId: tran_id } }
    }
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/cancel')
  async completePaymentCancel(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`Payment completion cancel callback for tran_id: ${tran_id}`)
    try {
      const data: any = await this.billingService.handleCancelPayment(tran_id, body)
      return {
        success: true,
        statusCode: 200,
        message: 'Payment was cancelled',
        data: {
          id: data?.id,
          status: data?.status,
          transactionId: tran_id,
        },
      }
    } catch (error) {
      this.logger.error(`Error in completePaymentCancel: ${error.message}`)
      return { success: false, statusCode: 500, message: 'Internal error during cancel processing', data: { transactionId: tran_id } }
    }
  }

  @Public()
  @Post('ipn')
  async ipn(@Body() body: any) {
    const { tran_id, status } = body
    if (status === 'VALID' || status === 'AUTHENTICATED') {
      await this.billingService.handleSuccessPayment(tran_id, body)
    }
    return { received: true }
  }

  @Public()
  @Get('complete')
  async completePaymentGet(@Query('tran_id') transactionId: string, @Res() res: Response) {
    if (!transactionId) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/billing?error=invalid_txn`,
      )
    }
    const defaultAppUrl = this.configService.get('FRONTEND_URL')
    return res.redirect(`${defaultAppUrl}/billing/success?tran_id=${transactionId}`)
  }
}
