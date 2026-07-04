import { Audit } from '@/common/decorators/audit.decorator'
import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Get, Logger, Post, Query, Res, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { Public } from '../../../common/decorators/public.decorator'
import { SubscriptionPlanEntity } from '../subscription-plan/entities/subscription-plan.entity'
import { CurrentSubscriptionResponseDto } from './dto/current-subscription-response.dto'
import { SubscriptionInvoiceResponseDto } from './dto/subscription-invoice-response.dto'
import { SubscriptionBillingService } from './subscription-billing.service'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'

@Controller('billing')
export class SubscriptionBillingController {
  private readonly logger = new Logger(SubscriptionBillingController.name)

  constructor(
    private readonly billingService: SubscriptionBillingService,
    private readonly configService: ConfigService,
    private readonly addonCatalogService: AddonCatalogService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('addon-catalog')
  @PublicDuringExpiration()
  @RequirePermissions(SystemPermissions.SETTINGS_BILLING)
  async getAddonCatalog(): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.addonCatalogService.findActive()
    return { success: true, statusCode: 200, message: 'Active addon catalog retrieved', data }
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  @PublicDuringExpiration()
  @RequirePermissions(SystemPermissions.SETTINGS_BILLING)
  async getCurrentSubscription(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CurrentSubscriptionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCurrentSubscription.`)
    const data = await this.billingService.getCurrentSubscription(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Current subscription retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans')
  @PublicDuringExpiration()
  @RequirePermissions(SystemPermissions.SETTINGS_BILLING)
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

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @PublicDuringExpiration()
  @RequirePermissions(SystemPermissions.SETTINGS_BILLING)
  async getBillingHistory(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SubscriptionInvoiceResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getBillingHistory.`)
    const data = await this.billingService.getBillingHistory(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Billing history retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  @PublicDuringExpiration()
  @RequirePermissions(SystemPermissions.SETTINGS_BILLING)
  @Audit({ entity: 'SubscriptionInvoice', action: 'INITIATE_PAYMENT' })
  async initiatePayment(
    @RequestContext() ctx: RequestContextDto,
    @Body('planId') planId: string,
    @Body('billingCycle') billingCycle: SubscriptionBillingCycle,
    @Body('frontendUrl') frontendUrl?: string,
  ): Promise<BaseApiSuccessResponse<{ gatewayUrl: string }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called initiatePayment.`)
    const data = await this.billingService.initiateSubscriptionPayment(
      ctx,
      planId,
      billingCycle,
      frontendUrl,
    )
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
  @Audit({ entity: 'SubscriptionInvoice', action: 'COMPLETE_SUCCESS' })
  async completePaymentSuccess(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `Payment completion success callback for tran_id: ${sanitizeLogInput(tran_id)}`,
    )
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
    } catch (error: any) {
      this.logger.error(`Error in completePaymentSuccess: ${error.message}`, error.stack)
      throw error
    }
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/fail')
  @Audit({ entity: 'SubscriptionInvoice', action: 'COMPLETE_FAIL' })
  async completePaymentFail(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `Payment completion failure callback for tran_id: ${sanitizeLogInput(tran_id)}`,
    )
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
    } catch (error: any) {
      this.logger.error(`Error in completePaymentFail: ${error.message}`)
      return {
        success: false,
        statusCode: 500,
        message: 'Internal error during failure processing',
        data: { transactionId: tran_id },
      }
    }
  }

  @Public()
  @PublicDuringExpiration()
  @Post('complete/cancel')
  @Audit({ entity: 'SubscriptionInvoice', action: 'COMPLETE_CANCEL' })
  async completePaymentCancel(
    @Query('tran_id') tran_id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `Payment completion cancel callback for tran_id: ${sanitizeLogInput(tran_id)}`,
    )
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
    } catch (error: any) {
      this.logger.error(`Error in completePaymentCancel: ${error.message}`)
      return {
        success: false,
        statusCode: 500,
        message: 'Internal error during cancel processing',
        data: { transactionId: tran_id },
      }
    }
  }

  @Public()
  @Post('ipn')
  @Audit({ entity: 'SubscriptionInvoice', action: 'IPN' })
  async ipn(@Body() body: any) {
    // IPN payloads are untrusted: the service performs a server-to-server
    // validator call before crediting the subscription, so we forward
    // unconditionally and let verifyTransaction reject anything bogus.
    const { tran_id } = body ?? {}
    if (typeof tran_id === 'string' && tran_id.length > 0) {
      try {
        await this.billingService.handleSuccessPayment(tran_id, body)
      } catch (err: any) {
        this.logger.warn(
          `IPN handling failed for tran_id=${sanitizeLogInput(tran_id)}: ${sanitizeLogInput(err?.message)}`,
        )
      }
    }
    return { received: true }
  }

  @Public()
  @Get('complete')
  async completePaymentGet(
    @Query('tran_id') transactionId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const defaultAppUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000'
    if (!transactionId) {
      return res.redirect(`${defaultAppUrl}/billing?error=invalid_txn`)
    }
    const redirectUrl = await this.billingService.getRedirectUrl(
      transactionId,
      query,
      defaultAppUrl,
    )
    return res.redirect(redirectUrl)
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase-addon')
  @PublicDuringExpiration()
  @RequirePermissions(SystemPermissions.SETTINGS_BILLING)
  @Audit({ entity: 'SubscriptionInvoice', action: 'PURCHASE_ADDON' })
  async purchaseAddon(
    @RequestContext() ctx: RequestContextDto,
    @Body('addonSlug') addonSlug: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${sanitizeLogInput(ctx.user?.username || 'System')}" purchasing addon "${sanitizeLogInput(addonSlug)}".`,
    )
    await this.billingService.purchaseAddon(ctx.storeId, addonSlug)
    return {
      success: true,
      statusCode: 200,
      message: 'Addon purchased successfully',
      data: null,
    }
  }
}

function sanitizeLogInput(input: any): string {
  if (input === null || input === undefined) {
    return ''
  }
  return String(input).replace(/[\r\n]/g, '_')
}
