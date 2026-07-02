import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { createHmac, timingSafeEqual } from 'crypto'
import { Request } from 'express'
import { Public } from '@/common/decorators/public.decorator'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

@ApiTags('courier/webhooks')
@Controller('courier/webhooks')
@Public() // Third-party courier callbacks are not authenticated by JWT — we
//         verify them with HMAC signatures instead.
export class CourierWebhookController {
  private readonly logger = new Logger(CourierWebhookController.name)

  constructor(
    private readonly orderService: OrderService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Verifies the HMAC-SHA256 signature against the raw request body using the
   * store-configured webhook secret. Uses timing-safe comparison.
   *
   * If no secret is configured for a store we LOG a warning and accept the
   * payload (backward-compatible — stores opt in by saving a secret in
   * settings). Once a secret is configured every subsequent request MUST be
   * signed correctly.
   */
  private async verifySignature(
    req: Request,
    headerSignature: string | undefined,
    storeId: string,
    secretPath: 'pathao' | 'steadfast',
  ): Promise<void> {
    const ctx = { storeId } as RequestContextDto
    const settings = await this.settingsService.findByStoreSettings(ctx)
    const secret =
      secretPath === 'pathao'
        ? settings?.pathaoCourier?.webhookSecret
        : settings?.steadfastCourier?.webhookSecret

    if (!secret) {
      this.logger.warn(
        `[Webhook ${secretPath}] No webhook secret configured for store ${storeId} — accepting unsigned payload. Configure 'webhookSecret' in store settings to enforce verification.`,
      )
      return
    }

    if (!headerSignature) {
      throw new UnauthorizedException('Webhook signature missing')
    }

    const rawBody: Buffer | undefined = (req as any).rawBody
    if (!rawBody) {
      throw new UnauthorizedException('Raw body unavailable; cannot verify signature')
    }

    // Strip any "sha256=" prefix some providers prepend.
    const provided = headerSignature
      .replace(/^sha256=/i, '')
      .trim()
      .toLowerCase()
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

    // Length must match before timingSafeEqual; otherwise it throws.
    if (provided.length !== expected.length) {
      throw new UnauthorizedException('Webhook signature mismatch')
    }
    const ok = timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
    if (!ok) {
      throw new UnauthorizedException('Webhook signature mismatch')
    }
  }

  @Post('steadfast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Steadfast Courier webhook status callback' })
  async handleSteadfastWebhook(
    @Req() req: Request,
    @Headers('x-steadfast-signature') signature: string,
    @Body() payload: any,
  ): Promise<any> {
    this.logger.log(`Received Steadfast webhook payload: ${JSON.stringify(payload)}`)

    const { status, tracking_code, invoice } = payload

    if (!tracking_code && !invoice) {
      return { success: false, message: 'Invalid payload' }
    }

    // Find order BEFORE verification so we know which store's secret to use.
    let order = tracking_code ? await this.orderService.findOrderByTrackingId(tracking_code) : null
    if (!order && invoice) {
      order = await this.orderService.findOrderByInvoiceCode(invoice)
    }
    if (!order) {
      this.logger.warn(
        `Order not found for Steadfast update: tracking_code=${tracking_code}, invoice=${invoice}`,
      )
      throw new NotFoundException('Order not found')
    }

    await this.verifySignature(req, signature, order.storeId, 'steadfast')

    // Map Steadfast status to ERP OrderStatus
    let targetStatus: OrderStatus = order.status
    let targetPaymentStatus: PaymentStatus = order.paymentStatus

    switch (status) {
      case 'delivered':
        targetStatus = OrderStatus.COMPLETED
        targetPaymentStatus = PaymentStatus.PAID
        break
      case 'cancelled':
      case 'returned':
        targetStatus = OrderStatus.CANCELLED
        targetPaymentStatus = PaymentStatus.FAILED
        break
      case 'in_transit':
        targetStatus = OrderStatus.SHIPPED
        break
      case 'hold':
        targetStatus = OrderStatus.PROCESSING
        break
    }

    const ctx: RequestContextDto = {
      storeId: order.storeId,
      userId: null as any,
      user: { id: 'SYSTEM', username: 'SYSTEM_WEBHOOK', role: 'system' } as any,
      branchId: null as any,
    }

    await this.orderService.updateOrder(
      order.id,
      {
        status: targetStatus,
        paymentStatus: targetPaymentStatus,
        trackingId: tracking_code || order.trackingId,
      },
      ctx,
    )

    return { success: true, message: 'Status synchronized successfully' }
  }

  @Post('pathao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pathao Courier webhook status callback' })
  async handlePathaoWebhook(
    @Req() req: Request,
    @Headers('x-pathao-signature') signature: string,
    @Body() payload: any,
  ): Promise<any> {
    this.logger.log(`Received Pathao webhook payload: ${JSON.stringify(payload)}`)

    const { consignment_id, merchant_order_id, status } = payload

    if (!consignment_id && !merchant_order_id) {
      return { success: false, message: 'Invalid payload' }
    }

    let order = consignment_id
      ? await this.orderService.findOrderByTrackingId(consignment_id)
      : null
    if (!order && merchant_order_id) {
      order = await this.orderService.findOrderByInvoiceCode(merchant_order_id)
    }
    if (!order) {
      this.logger.warn(
        `Order not found for Pathao update: consignment_id=${consignment_id}, merchant_order_id=${merchant_order_id}`,
      )
      throw new NotFoundException('Order not found')
    }

    await this.verifySignature(req, signature, order.storeId, 'pathao')

    let targetStatus: OrderStatus = order.status
    let targetPaymentStatus: PaymentStatus = order.paymentStatus

    switch (status) {
      case 'Delivered':
        targetStatus = OrderStatus.COMPLETED
        targetPaymentStatus = PaymentStatus.PAID
        break
      case 'Cancelled':
      case 'Returned':
        targetStatus = OrderStatus.CANCELLED
        targetPaymentStatus = PaymentStatus.FAILED
        break
      case 'Picked':
        targetStatus = OrderStatus.SHIPPED
        break
      case 'On Hold':
        targetStatus = OrderStatus.PROCESSING
        break
    }

    const ctx: RequestContextDto = {
      storeId: order.storeId,
      userId: null as any,
      user: { id: 'SYSTEM', username: 'SYSTEM_WEBHOOK', role: 'system' } as any,
      branchId: null as any,
    }

    await this.orderService.updateOrder(
      order.id,
      {
        status: targetStatus,
        paymentStatus: targetPaymentStatus,
        trackingId: consignment_id || order.trackingId,
      },
      ctx,
    )

    return { success: true, message: 'Status synchronized successfully' }
  }
}
