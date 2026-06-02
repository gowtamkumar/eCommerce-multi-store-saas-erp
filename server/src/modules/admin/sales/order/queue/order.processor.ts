import { Processor, WorkerHost } from '@nestjs/bullmq'
import { InjectDataSource } from '@nestjs/typeorm'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { PushService } from '@/modules/admin/operations/infra/push/push.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderService } from '../services/order.service'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { AccountingOutboxService } from '@/modules/admin/operations/finance/accounting/services/accounting-outbox.service'
import { ProductBatchService } from '@/modules/admin/operations/logistics/inventory-transaction/product-batch.service'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Processor('order')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name)

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    private readonly notificationService: NotificationService,
    private readonly orderService: OrderService,
    private readonly stockReservationService: StockReservationService,
    private readonly accountingOutboxService: AccountingOutboxService,
    private readonly productBatchService: ProductBatchService,
    @InjectDataSource() private readonly dataSource: DataSource,
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
        case 'sweep-expired-reservations':
          this.logger.log('Starting automated sweep of expired active reservations...')
          const count = await this.stockReservationService.expireStale()
          return { expiredCount: count }
        case 'process-accounting-outbox':
          this.logger.log('Starting execution of accounting outbox pending transactions sweep...')
          await this.accountingOutboxService.processPending()
          return { success: true }
        case 'sweep-expired-batches':
          return await this.handleSweepExpiredBatches()
        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Sweeps expired batches across every tenant and writes off any residual stock.
   * The actual transactional work runs inside ProductBatchService.markExpiredBatches.
   */
  async handleSweepExpiredBatches() {
    this.logger.log('Starting daily sweep of expired product batches...')
    const tenantRepo = this.dataSource.getRepository(TenantEntity)
    const tenants = await tenantRepo.find({ select: ['id'] })
    let totalAffected = 0
    for (const tenant of tenants) {
      try {
        const affected = await this.productBatchService.markExpiredBatches(tenant.id)
        if (affected > 0) {
          this.logger.log(`Tenant ${tenant.id}: marked ${affected} expired batch(es)`)
        }
        totalAffected += affected
      } catch (err: any) {
        this.logger.error(
          `Tenant ${tenant.id}: expired-batch sweep failed: ${err.message}`,
          err.stack,
        )
      }
    }
    this.logger.log(`Daily batch sweep finished. Total batches expired: ${totalAffected}`)
    return { totalAffected }
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
          this.logger.log(
            `SMS notification sent successfully to ${orderWithRelations.customerPhone}`,
          )
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
          this.logger.error(
            `Failed to trigger push notification for order ${orderId}`,
            pushError.stack,
          )
        }
      }

      // 4. Send In-App System Notification for Admins
      try {
        await this.notificationService.createNotification(
          {
            userId: null as any, // Null means tenant-wide notification for all admins
            title: `New Order #${orderWithRelations.id}`,
            message: `A new order has been placed for ${orderWithRelations.currency} ${Number(orderWithRelations.totalAmount).toFixed(2)}.`,
            type: 'ORDER',
            link: `/admin/orders/${orderWithRelations.id}`,
          },
          tenantId,
        )
        this.logger.log(`In-app system notification created for order ${orderId}`)
      } catch (sysNotifError) {
        this.logger.error(
          `Failed to create system notification for order ${orderId}`,
          sysNotifError.stack,
        )
      }
    } else {
      this.logger.warn(`Order ${orderId} not found for notification`)
    }
  }
}
