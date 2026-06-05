import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { InvoiceService } from './invoice.service'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'

@Processor('invoice')
export class InvoiceProcessor extends WorkerHost {
  private readonly logger = new Logger(InvoiceProcessor.name)

  constructor(private readonly invoiceService: InvoiceService) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    const { payload, ctx } = job.data
    try {
      switch (job.name) {
        case 'create-invoice': {
          const { orderId, paymentStatus } = payload
          this.logger.log(`Creating invoice for order ${orderId}`)
          await this.invoiceService.createInvoice(
            {
              orderId,
              issueDate: new Date(),
              status: paymentStatus === 'PAID' ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
            } as any,
            ctx,
          )
          this.logger.log(`Invoice created successfully for order ${orderId}`)
          return { success: true }
        }

        case 'update-invoice-paid': {
          const { orderId } = payload
          this.logger.log(`Updating invoice status to PAID for order ${orderId}`)
          await this.invoiceService.updateInvoiceStatusByOrderId(orderId, InvoiceStatus.PAID, ctx)
          this.logger.log(`Successfully updated invoice status to PAID for order ${orderId}`)
          return { success: true }
        }

        case 'update-invoice-cancelled': {
          const { orderId } = payload
          this.logger.log(`Updating invoice status to CANCELLED for order ${orderId}`)
          await this.invoiceService.updateInvoiceStatusByOrderId(
            orderId,
            InvoiceStatus.CANCELLED,
            ctx,
          )
          this.logger.log(`Successfully updated invoice status to CANCELLED for order ${orderId}`)
          return { success: true }
        }

        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }
}
