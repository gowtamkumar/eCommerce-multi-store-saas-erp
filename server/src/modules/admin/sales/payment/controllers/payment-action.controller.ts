import { Audit } from '@/common/decorators/audit.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Post, Query, Res, Logger, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Response } from 'express'
import { InitPaymentDto } from '../dto/payment.dto'
import { PaymentService } from '../services/payment.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'

@Controller('payment')
export class PaymentActionController {
  private readonly logger = new Logger(PaymentActionController.name)

  constructor(private readonly paymentService: PaymentService) {}

  // @Throttle({ transactional: { limit: 10, ttl: 60000 } })
  @Post('init')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('orders')
  @Audit({ entity: 'Payment', action: 'INIT' })
  async init(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: InitPaymentDto,
  ): Promise<BaseApiSuccessResponse<{ gatewayUrl: string }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called init.`)
    const result = await this.paymentService.initPayment(dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Payment initiated successfully',
      data: result,
    }
  }

  // Redirect endpoints — cannot return JSON wrappers as they perform HTTP redirects
  @Post('success')
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  async success(
    @Query('tran_id') tran_id: string,
    @Body() gatewayResponse: any,
    @Res() res: Response,
  ) {
    await this.paymentService.handleSuccessPayment(tran_id, gatewayResponse)
    const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = await this.paymentService.getRedirectUrl(
      tran_id,
      gatewayResponse,
      defaultAppUrl,
    )
    return res.redirect(redirectUrl)
  }

  @Post('fail')
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  async fail(
    @Query('tran_id') tran_id: string,
    @Body() gatewayResponse: any,
    @Res() res: Response,
  ) {
    await this.paymentService.handleFailPayment(tran_id, gatewayResponse)
    const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = await this.paymentService.getRedirectUrl(
      tran_id,
      gatewayResponse,
      defaultAppUrl,
    )
    return res.redirect(redirectUrl)
  }

  @Post('cancel')
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  async cancel(
    @Query('tran_id') tran_id: string,
    @Body() gatewayResponse: any,
    @Res() res: Response,
  ) {
    await this.paymentService.handleCancelPayment(tran_id, gatewayResponse)
    const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = await this.paymentService.getRedirectUrl(
      tran_id,
      gatewayResponse,
      defaultAppUrl,
    )
    return res.redirect(redirectUrl)
  }

  @Post('ipn')
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  @RequirePermissions(SystemPermissions.PAYMENTS_READ)
  async ipn(
    @Body() gatewayResponse: any,
  ): Promise<BaseApiSuccessResponse<{ success: boolean }> | { received: boolean }> {
    const { tran_id, status } = gatewayResponse
    if (status === 'VALID' || status === 'AUTHENTICATED') {
      const result = await this.paymentService.handleSuccessPayment(tran_id, gatewayResponse)
      return {
        success: true,
        statusCode: 200,
        message: 'IPN processed successfully',
        data: result,
      }
    }
    return { received: true }
  }
}
