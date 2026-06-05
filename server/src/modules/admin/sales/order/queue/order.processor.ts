import { Processor, WorkerHost } from '@nestjs/bullmq'
import { InjectDataSource } from '@nestjs/typeorm'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { PushService } from '@/modules/admin/operations/infra/push/push.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { OrderService } from '../services/order.service'

@Processor('order')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name)

  constructor(
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    private readonly notificationService: NotificationService,
    private readonly orderService: OrderService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    try {
      switch (job.name) {
        case 'send-order-notification':
          return await this.handleSendOrderNotification(job.data)
        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
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
        } catch (smsError: any) {
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
        } catch (pushError: any) {
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
      } catch (sysNotifError: any) {
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
