import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { StockReservationEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-reservation.entity'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { PaymentEntity } from '../../payment/entities/payment.entity'
import { PaymentRepository } from '../../payment/repositories/payment.repository'
import { OrderRepository } from '../repositories/order.repository'

import { LoyaltyService } from '@/modules/admin/marketing/loyalty/services/loyalty.service'
import { ReferralService } from '@/modules/admin/marketing/loyalty/services/referral.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class OrderLifecycleService {
  private readonly logger = new Logger(OrderLifecycleService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private readonly inventoryService: InventoryLedgerService,
    private readonly reservationService: StockReservationService,
    private readonly dataSource: DataSource,
    @InjectQueue('accounting') private readonly accountingQueue: Queue,
    @InjectQueue('invoice') private readonly invoiceQueue: Queue,
    @InjectQueue('fulfillment') private readonly fulfillmentQueue: Queue,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
    private readonly loyaltyService: LoyaltyService,
    private readonly referralService: ReferralService,
  ) {}

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    ctx: RequestContextDto,
  ): Promise<OrderEntity> {
    this.logger.log(`${this.updateOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.orderRepository.findOrderById(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    // Using query runner for business transaction
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    // Side effects (queue jobs) must only run AFTER the DB transaction commits,
    // otherwise a rollback would leave workers acting on state that never
    // persisted. We collect them here and dispatch post-commit.
    const postCommitJobs: Array<() => Promise<unknown>> = []

    try {
      const oldStatus = order.status
      const oldPaymentStatus = order.paymentStatus

      // Check if payment status is changing to PAID
      if (
        updateOrderDto.paymentStatus === PaymentStatus.PAID &&
        oldPaymentStatus !== PaymentStatus.PAID
      ) {
        const transactionId =
          updateOrderDto.transactionId || order.transactionId || `MANUAL_COD_${Date.now()}`

        const existingPayment = await queryRunner.manager.findOne(PaymentEntity, {
          where: { transactionId, tenantId },
        })

        if (!existingPayment) {
          await this.paymentRepository.createAndSave(
            {
              orderId: order.id,
              transactionId,
              amount: order.totalAmount,
              currency: order.currency,
              method: order.paymentMethod || PaymentMethod.COD,
              status: PaymentStatus.COMPLETED,
              gatewayResponse: { note: 'Manual update from admin dashboard' },
            },
            ctx,
            queryRunner.manager,
          )
        }
      }

      // Check for Order Cancellation to Restore Stock
      if (
        updateOrderDto.status === OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.COMPLETED // Don't restore if already completed? Usually, returns handle that.
      ) {
        for (const item of order.items) {
          if (item.product?.productType === 'SERVICE') continue

          // 1. Immutable RESERVATION_CANCEL ledger entry (keeps audit stream intact)
          await this.inventoryService.createLedgerEntry(
            {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              type: InventoryTransactionType.RESERVATION_CANCEL,
              referenceType: InventoryTransactionReferenceType.ORDER,
              referenceId: order.id,
            },
            ctx,
            queryRunner.manager,
          )

          // 2. Transition the stock_reservations row to RELEASED for clean lifecycle state.
          //    Look up by orderId + productId + variantId — the unique key for a reservation.
          const existingReservation = await queryRunner.manager.findOne(StockReservationEntity, {
            where: {
              orderId: order.id,
              productId: item.productId,
              variantId: item.variantId ?? null,
              tenantId,
            },
          })
          if (existingReservation) {
            await this.reservationService.release(
              existingReservation.id,
              null, // release all remaining
              ctx,
              queryRunner.manager,
            )
          }
        }
      }

      // Check for Order Completion - removed old deduction logic here since it's now deducted at creation

      Object.assign(order, updateOrderDto)
      const savedOrder = await queryRunner.manager.save(order)

      // Loyalty points and referral rewards upon order completion
      if (updateOrderDto.status === OrderStatus.COMPLETED && oldStatus !== OrderStatus.COMPLETED) {
        await this.loyaltyService.processOrderEarning(savedOrder, ctx, queryRunner.manager)
        if (savedOrder.userId) {
          await this.referralService.processFirstPurchaseReward(
            savedOrder.userId,
            savedOrder.id,
            savedOrder.totalAmount,
            ctx,
            queryRunner.manager,
          )
        }

        // Recognition of Cash/Payment and Sales Revenue for standard sales
        postCommitJobs.push(() =>
          this.accountingQueue.add(
            'post-order-paid',
            {
              ctx,
              payload: {
                orderId: savedOrder.id,
                paymentMethod: savedOrder.paymentMethod,
                walletDeduction: Number(savedOrder.walletDeductionAmount || 0),
                remainingAmount:
                  Number(savedOrder.totalAmount) - Number(savedOrder.walletDeductionAmount || 0),
                netRevenue: Number(savedOrder.totalAmount) - Number(savedOrder.taxAmount || 0),
                taxAmount: Number(savedOrder.taxAmount || 0),
              },
            },
            { removeOnComplete: true },
          ),
        )

        postCommitJobs.push(() =>
          this.invoiceQueue.add(
            'update-invoice-paid',
            {
              ctx,
              payload: {
                orderId: savedOrder.id,
              },
            },
            { removeOnComplete: true },
          ),
        )
      }

      // Sync Invoice Status
      if (updateOrderDto.status === OrderStatus.CANCELLED) {
        postCommitJobs.push(() =>
          this.invoiceQueue.add(
            'update-invoice-cancelled',
            {
              ctx,
              payload: { orderId: id },
            },
            { removeOnComplete: true },
          ),
        )
      }

      // Check for Order Confirmation to Trigger Fulfillment
      if (updateOrderDto.status === OrderStatus.CONFIRMED && oldStatus !== OrderStatus.CONFIRMED) {
        postCommitJobs.push(() =>
          this.fulfillmentQueue.add(
            'create-fulfillment-task',
            {
              ctx,
              payload: { orderId: id },
            },
            { removeOnComplete: true },
          ),
        )
      }

      await queryRunner.commitTransaction()

      // Dispatch deferred side effects now that the transaction is durable.
      for (const job of postCommitJobs) {
        try {
          await job()
        } catch (e: any) {
          this.logger.error(`Failed to enqueue post-commit job for order ${id}: ${e.message}`)
        }
      }

      // Notifications
      try {
        // Payment Failures / Refund Request
        if (
          updateOrderDto.paymentStatus === PaymentStatus.FAILED &&
          oldPaymentStatus !== PaymentStatus.FAILED
        ) {
          const action = 'failed'
          await this.notificationService.createNotification(
            {
              title: 'Payment Failed',
              message: `Payment for Order #${savedOrder.id.substring(0, 8)} ${action}.`,
              type: 'DANGER',
              link: `/admin/orders/${savedOrder.id}`,
              userId: null as any,
            },
            tenantId,
          )
        }

        // Shipped / Completed
        if (updateOrderDto.status === OrderStatus.SHIPPED && oldStatus !== OrderStatus.SHIPPED) {
          await this.notificationService.createNotification(
            {
              title: 'Order Shipped',
              message: `Order #${savedOrder.id.substring(0, 8)} has been shipped.`,
              type: 'INFO',
              link: `/admin/orders/${savedOrder.id}`,
              userId: null as any,
            },
            tenantId,
          )
        } else if (
          updateOrderDto.status === OrderStatus.COMPLETED &&
          oldStatus !== OrderStatus.COMPLETED
        ) {
          await this.notificationService.createNotification(
            {
              title: 'Order Delivered',
              message: `Order #${savedOrder.id.substring(0, 8)} has been delivered successfully.`,
              type: 'SUCCESS',
              link: `/admin/orders/${savedOrder.id}`,
              userId: null as any,
            },
            tenantId,
          )
        }
      } catch (e: any) {
        this.logger.error(`Failed to trigger order notifications: ${e.message}`)
      }

      await Promise.all([
        this.cacheService.delCache('orders:overview', tenantId),
        this.cacheService.delCacheByPattern('analytics*', tenantId),
        this.cacheService.delCacheByPattern('dashboard*', tenantId),
        this.cacheService.delCacheByPattern('pnl*', tenantId),
        this.cacheService.delCacheByPattern('cashflow*', tenantId),
        this.cacheService.delCacheByPattern('finance:summary*', tenantId),
        this.cacheService.delCacheByPattern('ledger:customer*', tenantId),
      ])
      return savedOrder
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }
}
