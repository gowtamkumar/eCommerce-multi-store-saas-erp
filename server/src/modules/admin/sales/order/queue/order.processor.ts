import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderService } from '../services/order.service'

@Processor('order')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name)

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly mailService: MailService,
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

    const orderWithRelations = await this.orderService.findOneOrder(orderId, tenantId)

    if (orderWithRelations) {
      await this.mailService.sendNewOrderNotification(orderWithRelations, tenantId)
      this.logger.log(`Order notification sent successfully for order ${orderId}`)
    } else {
      this.logger.warn(`Order ${orderId} not found for notification`)
    }
  }
}
