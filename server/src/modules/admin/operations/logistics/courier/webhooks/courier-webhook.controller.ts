import { Body, Controller, Post, HttpCode, HttpStatus, Logger, NotFoundException } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '@/common/decorators/public.decorator'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

@ApiTags('courier/webhooks')
@Controller('courier/webhooks')
@Public() // Public access for third-party courier callbacks
export class CourierWebhookController {
  private readonly logger = new Logger(CourierWebhookController.name)

  constructor(private readonly orderService: OrderService) {}

  @Post('steadfast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Steadfast Courier webhook status callback' })
  async handleSteadfastWebhook(@Body() payload: any): Promise<any> {
    this.logger.log(`Received Steadfast webhook payload: ${JSON.stringify(payload)}`)

    const { status, tracking_code, invoice } = payload

    if (!tracking_code && !invoice) {
      return { success: false, message: 'Invalid payload' }
    }

    // Try finding order by tracking code first, then by invoice code
    let order = tracking_code ? await this.orderService.findOrderByTrackingId(tracking_code) : null
    if (!order && invoice) {
      order = await this.orderService.findOrderByInvoiceCode(invoice)
    }

    if (!order) {
      this.logger.warn(`Order not found for Steadfast update: tracking_code=${tracking_code}, invoice=${invoice}`)
      throw new NotFoundException('Order not found')
    }

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

    // Update order with dynamic system context
    const ctx: RequestContextDto = {
      tenantId: order.tenantId,
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
  async handlePathaoWebhook(@Body() payload: any): Promise<any> {
    this.logger.log(`Received Pathao webhook payload: ${JSON.stringify(payload)}`)

    const { consignment_id, merchant_order_id, status } = payload

    if (!consignment_id && !merchant_order_id) {
      return { success: false, message: 'Invalid payload' }
    }

    // Find order by consignment ID or merchant order ID
    let order = consignment_id ? await this.orderService.findOrderByTrackingId(consignment_id) : null
    if (!order && merchant_order_id) {
      order = await this.orderService.findOrderByInvoiceCode(merchant_order_id)
    }

    if (!order) {
      this.logger.warn(`Order not found for Pathao update: consignment_id=${consignment_id}, merchant_order_id=${merchant_order_id}`)
      throw new NotFoundException('Order not found')
    }

    // Map Pathao status to ERP OrderStatus
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

    // Update order with dynamic system context
    const ctx: RequestContextDto = {
      tenantId: order.tenantId,
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
