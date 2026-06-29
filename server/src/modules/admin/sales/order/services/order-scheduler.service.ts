import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThan, Repository } from 'typeorm'
import { OrderEntity } from '../entities/order.entity'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { StockReservationEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-reservation.entity'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { DataSource } from 'typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

/** Orders in PENDING state for longer than this are automatically cancelled and stock released. */
const STALE_ORDER_THRESHOLD_HOURS = 24

@Injectable()
export class OrderSchedulerService {
  private readonly logger = new Logger(OrderSchedulerService.name)

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly inventoryService: InventoryLedgerService,
    private readonly reservationService: StockReservationService,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Runs every hour. Finds PENDING/unpaid orders older than the threshold and
   * cancels them, releasing all reserved stock back into the available pool.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cancelStalePendingOrders(): Promise<void> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - STALE_ORDER_THRESHOLD_HOURS)

    try {
      const staleOrders = await this.orderRepo.find({
        where: {
          status: OrderStatus.PENDING,
          paymentStatus: In([PaymentStatus.PENDING, PaymentStatus.FAILED]),
          createdAt: LessThan(cutoff),
        },
        relations: { items: true },
      })

      if (staleOrders.length === 0) return

      this.logger.log(
        `Auto-cancel: found ${staleOrders.length} stale PENDING orders older than ${STALE_ORDER_THRESHOLD_HOURS}h`,
      )

      for (const order of staleOrders) {
        try {
          await this.dataSource.transaction(async (manager) => {
            // Cancel the order
            order.status = OrderStatus.CANCELLED
            await manager.save(OrderEntity, order)

            // Release reserved stock for each physical item
            for (const item of order.items) {
              if (item.product?.productType === 'SERVICE') continue

              // Immutable ledger: RESERVATION_CANCEL
              await this.inventoryService.createLedgerEntry(
                {
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                  type: InventoryTransactionType.RESERVATION_CANCEL,
                  referenceType: InventoryTransactionReferenceType.ORDER,
                  referenceId: order.id,
                },
                { tenantId: order.tenantId } as any,
                manager,
              )

              // Release stock_reservations row
              const reservation = await manager.findOne(StockReservationEntity, {
                where: {
                  orderId: order.id,
                  productId: item.productId,
                  variantId: item.variantId ?? null,
                  tenantId: order.tenantId,
                },
              })
              if (reservation) {
                await this.reservationService.release(
                  reservation.id,
                  null,
                  { tenantId: order.tenantId } as any,
                  manager,
                )
              }
            }
          })

          // Invalidate cache per tenant
          await Promise.all([
            this.cacheService.delCache('orders:overview', order.tenantId),
            this.cacheService.delCacheByPattern('analytics*', order.tenantId),
          ])

          this.logger.log(`Auto-cancelled stale order ${order.id} for tenant ${order.tenantId}`)
        } catch (err: any) {
          this.logger.error(`Failed to auto-cancel order ${order.id}: ${err.message}`)
        }
      }
    } catch (err: any) {
      this.logger.error(`OrderSchedulerService cron failed: ${err.message}`)
    }
  }
}
