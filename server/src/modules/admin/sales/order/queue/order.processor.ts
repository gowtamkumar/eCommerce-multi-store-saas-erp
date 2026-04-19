import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { PushService } from '@/modules/admin/operations/infra/push/push.service'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderService } from '../services/order.service'

@Processor('order')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name)

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    private readonly orderService: OrderService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    try {
      switch (job.name) {
        case 'create-invoice':
          return await this.handleCreateInvoice(job.data)
        case 'send-order-notification':
          return await this.handleSendOrderNotification(job.data)
        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async handleCreateInvoice(data: any) {
    const { orderId, tenantId, paymentStatus } = data
    this.logger.log(`Creating invoice for order ${orderId} (tenant: ${tenantId})`)

    await this.invoiceService.createInvoice(
      {
        orderId: orderId,
        issueDate: new Date(),
        status: paymentStatus === 'PAID' ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
      } as any,
      tenantId,
    )

    this.logger.log(`Invoice created successfully for order ${orderId}`)
  }

  async handleSendOrderNotification(data: any) {
    const { orderId, tenantId } = data
    this.logger.log(`Sending order notification for order ${orderId} (tenant: ${tenantId})`)

    const orderWithRelations = await this.orderService.findOneOrder(orderId, { tenantId } as any)

    if (orderWithRelations) {
      // 1. Send Email Notification
      await this.mailService.sendNewOrderNotification(orderWithRelations, tenantId)
      this.logger.log(`Email notification sent successfully for order ${orderId}`)

      // 2. Send SMS Notification (if phone available)
      if (orderWithRelations.customerPhone) {
        const brandName = orderWithRelations.tenant?.storeName || 'our store'
        const message = `Thank you for your order #${orderWithRelations.id} at ${brandName}. Total: ${orderWithRelations.currency} ${Number(orderWithRelations.totalAmount).toFixed(2)}. We will process it shortly.`

        try {
          await this.smsService.sendSms(orderWithRelations.customerPhone, message, tenantId)
          this.logger.log(`SMS notification sent successfully to ${orderWithRelations.customerPhone}`)
        } catch (smsError) {
          this.logger.error(`Failed to send SMS notification for order ${orderId}`, smsError.stack)
          // Don't throw - we don't want to fail the whole job if only SMS fails
        }
      }

      // 3. Send Web Push Notification (if linked to a user)
      if (orderWithRelations.userId) {
        try {
          const brandName = orderWithRelations.tenant?.storeName || 'our store'
          await this.pushService.sendToUser(
            orderWithRelations.userId,
            {
              title: `Order #${orderWithRelations.id} Confirmed`,
              body: `Thank you for shopping at ${brandName}. Your order total is ${orderWithRelations.currency} ${Number(orderWithRelations.totalAmount).toFixed(2)}.`,
              url: `/account/orders/${orderWithRelations.id}`,
            },
            tenantId,
          )
          this.logger.log(`Push notification triggered successfully for order ${orderId}`)
        } catch (pushError) {
          this.logger.error(`Failed to trigger push notification for order ${orderId}`, pushError.stack)
        }
      }
    } else {
      this.logger.warn(`Order ${orderId} not found for notification`)
    }
  }
}
