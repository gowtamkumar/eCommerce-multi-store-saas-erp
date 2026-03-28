import { Controller, Get, Post, Body, UseGuards, Query, Res } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionBillingService } from './subscription-billing.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { Public } from '../../../common/decorators/public.decorator'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class SubscriptionBillingController {
  constructor(
    private readonly billingService: SubscriptionBillingService,
    private readonly configService: ConfigService,
  ) {}

  @Get('current')
  @PublicDuringExpiration()
  async getCurrentSubscription(@RequestContext() ctx: RequestContextDto) {
    return await this.billingService.getCurrentSubscription(ctx.tenantId)
  }

  @Get('plans')
  @PublicDuringExpiration()
  async getAvailablePlans() {
    return await this.billingService.getAvailablePlans()
  }

  @Get('history')
  @PublicDuringExpiration()
  async getBillingHistory(@RequestContext() ctx: RequestContextDto) {
    return await this.billingService.getBillingHistory(ctx.tenantId)
  }

  @Post('initiate')
  @PublicDuringExpiration()
  async initiatePayment(@RequestContext() ctx: RequestContextDto, @Body('planId') planId: string, @Body('frontendUrl') frontendUrl?: string) {
    return await this.billingService.initiateSubscriptionPayment(ctx.tenantId, planId, frontendUrl)
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/success')
  async completePaymentSuccess(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    await this.billingService.handleSuccessPayment(tran_id, body)
    const defaultAppUrl = this.configService.get('FRONTEND_URL')
    const redirectUrl = await this.billingService.getRedirectUrl(tran_id, body, defaultAppUrl)
    return res.redirect(redirectUrl)
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/fail')
  async completePaymentFail(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    await this.billingService.handleFailPayment(tran_id, body)
    const defaultAppUrl = this.configService.get('FRONTEND_URL')
    const redirectUrl = await this.billingService.getRedirectUrl(tran_id, body, defaultAppUrl)
    return res.redirect(redirectUrl)
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/cancel')
  async completePaymentCancel(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    await this.billingService.handleCancelPayment(tran_id, body)
    const defaultAppUrl = this.configService.get('FRONTEND_URL')
    const redirectUrl = await this.billingService.getRedirectUrl(tran_id, body, defaultAppUrl)
    return res.redirect(redirectUrl)
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
    // Basic GET handler for simple tests or direct navigation
    if (!transactionId) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/admin/settings/billing?error=invalid_txn`,
      )
    }
    const defaultAppUrl = this.configService.get('FRONTEND_URL')
    return res.redirect(`${defaultAppUrl}/admin/settings/billing/success?tran_id=${transactionId}`)
  }
}
