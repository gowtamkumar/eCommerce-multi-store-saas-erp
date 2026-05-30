import { ReturnStatus } from '@/common/enums/return-status.enum'
import { RefundMethod, ReturnType } from '@/common/enums/refund-method.enum'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'

import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto'
import { OrderReturnRepository } from '@/modules/admin/sales/order/repositoris/order-return.repository'
import { OrderRepository } from '@/modules/admin/sales/order/repositoris/order.repository'
import { FilterReturnDto } from '../dto/filter-return.dto'
import { OrderReturnEntity } from '../entities/order-return.entity'

import { RequestContextDto } from '@/common/dto/request-context.dto'

import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'

/** Return window policy: returns are only accepted within this many days of the original order. */
const RETURN_WINDOW_DAYS = 30

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name)

  constructor(
    private returnRepository: OrderReturnRepository,
    private orderRepository: OrderRepository,
    private inventoryService: InventoryLedgerService,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
    private readonly accountingService: AccountingService,
  ) {}

  async createReturnRequest(
    ctx: RequestContextDto,
    dto: CreateReturnDto,
  ): Promise<OrderReturnEntity> {
    this.logger.log(`${this.createReturnRequest.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const { orderId, items, reason, returnType, refundMethod } = dto

    const order = await this.orderRepository.findOrderById(orderId, tenantId)

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found or does not belong to user')
    }

    // ── Return window policy ──────────────────────────────────────────────────
    const MS_PER_DAY = 86_400_000
    const daysSinceOrder = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / MS_PER_DAY)
    if (daysSinceOrder > RETURN_WINDOW_DAYS) {
      throw new BadRequestException(
        `Returns are only accepted within ${RETURN_WINDOW_DAYS} days of the original purchase. This order was placed ${daysSinceOrder} days ago.`,
      )
    }

    // Build map of cumulative returned quantities
    const alreadyReturnedMap: Record<string, number> = {}
    if (order.returns) {
      for (const ret of order.returns) {
        if (ret.status !== ReturnStatus.REJECTED && ret.status !== ReturnStatus.CANCELLED) {
          for (const item of ret.items) {
            const key = `${item.productId}_${item.variantId || 'none'}`
            alreadyReturnedMap[key] = (alreadyReturnedMap[key] || 0) + Number(item.quantity)
          }
        }
      }
    }

    let calculatedRefundAmount = 0

    for (const returnItem of items) {
      const orderItem = order.items.find(
        (oi) =>
          oi.productId === returnItem.productId &&
          (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId)),
      )

      if (!orderItem) {
        throw new BadRequestException('Item not found in order')
      }

      const key = `${returnItem.productId}_${returnItem.variantId || 'none'}`
      const alreadyReturned = alreadyReturnedMap[key] || 0
      const maxAllowed = orderItem.quantity - alreadyReturned

      if (returnItem.quantity > maxAllowed) {
        throw new BadRequestException(
          `Return quantity (${returnItem.quantity}) exceeds remaining allowed quantity (${maxAllowed}). Already returned: ${alreadyReturned}.`,
        )
      }

      const netUnitPrice = Number(orderItem.unitPrice || 0) - Number(orderItem.discountAmount || 0)
      let itemRefundTotal = netUnitPrice * returnItem.quantity

      // Prorate order-level coupon discount
      const orderSubtotal = order.items.reduce(
        (sum, oi) => sum + (Number(oi.unitPrice) - Number(oi.discountAmount || 0)) * oi.quantity,
        0,
      )
      if (orderSubtotal > 0 && Number(order.couponDiscountAmount) > 0) {
        const itemShareRatio = itemRefundTotal / orderSubtotal
        const couponReduction = Number(order.couponDiscountAmount) * itemShareRatio
        itemRefundTotal = Math.max(0, itemRefundTotal - couponReduction)
      }

      calculatedRefundAmount += itemRefundTotal
    }

    const result = await this.returnRepository.createAndSaveReturn(
      {
        orderId,
        reason,
        items,
        refundAmount: calculatedRefundAmount,
        returnType: returnType ?? ReturnType.REFUND,
        refundMethod: refundMethod ?? RefundMethod.STORE_CREDIT,
      },
      ctx,
    )

    // Trigger Notification for Refund/Return Request
    try {
      await this.notificationService.createNotification(
        {
          title: returnType === ReturnType.EXCHANGE ? 'Exchange Requested' : 'Refund Requested',
          message: `Customer requested a ${returnType ?? 'return'} for Order #${order.id.substring(0, 8)}.`,
          type: 'WARNING',
          link: `/admin/sales/returns/${result.id}`,
          userId: null as any,
        },
        tenantId,
      )
    } catch (e) {
      this.logger.error(`Failed to trigger return/refund notification: ${e.message}`)
    }

    // Invalidate the admin list cache so the new return appears immediately
    await this.cacheService.delCache('returns:all', tenantId)
    return result
  }

  async findAllReturns(
    ctx: RequestContextDto,
    filterDto: FilterReturnDto,
  ): Promise<{ data: OrderReturnEntity[]; total: number }> {
    this.logger.log(`${this.findAllReturns.name} Service Called`)
    const tenantId = ctx.tenantId

    // Create a unique cache key based on the filter parameters
    const cacheKey = `returns:all:${JSON.stringify(filterDto)}`

    return this.cacheService.rememberCache(
      cacheKey,
      () => this.returnRepository.findPaginated(tenantId, filterDto),
      120, // 2-minute cache
      tenantId,
    )
  }

  async findByUser(ctx: RequestContextDto): Promise<OrderReturnEntity[]> {
    this.logger.log(`${this.findByUser.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    return await this.returnRepository.findByUserWithRelations(userId, tenantId)
  }

  async findOneReturn(id: string, ctx: RequestContextDto): Promise<OrderReturnEntity> {
    this.logger.log(`${this.findOneReturn.name} Service Called`)
    const tenantId = ctx.tenantId
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)

    if (!returnRequest) {
      throw new NotFoundException('Return request not found')
    }

    return returnRequest
  }

  /**
   * Admin marks items as physically received at the store/warehouse.
   * Transitions: PENDING → RECEIVED
   */
  async markItemsReceived(id: string, ctx: RequestContextDto): Promise<OrderReturnEntity> {
    this.logger.log(`${this.markItemsReceived.name} Service Called`)
    const tenantId = ctx.tenantId
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)
    if (!returnRequest) throw new NotFoundException('Return request not found')

    const terminalStatuses = [
      ReturnStatus.REFUNDED, ReturnStatus.EXCHANGED,
      ReturnStatus.REJECTED, ReturnStatus.CANCELLED,
    ]
    if (terminalStatuses.includes(returnRequest.status)) {
      throw new BadRequestException(`Cannot mark items received on a ${returnRequest.status} return`)
    }
    if (returnRequest.receivedAt) {
      throw new BadRequestException('Items have already been marked as received')
    }

    const updated = await this.returnRepository.markReceived(returnRequest)
    await Promise.all([
      this.cacheService.delCacheByPattern('returns:all*', tenantId),
      this.cacheService.delCacheByPattern('analytics*', tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
      this.cacheService.delCacheByPattern('pnl*', tenantId),
      this.cacheService.delCacheByPattern('cashflow*', tenantId),
      this.cacheService.delCacheByPattern('finance:summary*', tenantId),
    ])
    return updated
  }

  /**
   * Admin links a new sale order to this return (completing an exchange).
   * Sets returnType=EXCHANGE, exchangeOrderId, status=EXCHANGED.
   * Posts a GL memo journal to record the exchange reconciliation.
   */
  async linkExchangeOrder(
    id: string,
    ctx: RequestContextDto,
    newOrderId: string,
  ): Promise<OrderReturnEntity> {
    this.logger.log(`${this.linkExchangeOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)
    if (!returnRequest) throw new NotFoundException('Return request not found')

    if (returnRequest.status !== ReturnStatus.APPROVED && returnRequest.status !== ReturnStatus.REFUNDED) {
      throw new BadRequestException('Can only link an exchange order to an APPROVED or REFUNDED return')
    }

    const updated = await this.returnRepository.linkExchange(returnRequest, newOrderId)

    // ── Post a GL memo journal to record the exchange reconciliation ──────────
    try {
      const refundAmount = Number(returnRequest.refundAmount || 0)
      if (refundAmount > 0) {
        await this.accountingService.createJournalEntry(
          {
            type: JournalType.GENERAL,
            description: `Exchange Completed — Return #${returnRequest.id.substring(0, 8)} linked to new Order #${newOrderId.substring(0, 8)}`,
            referenceType: 'ORDER_EXCHANGE',
            referenceId: returnRequest.id,
            lines: [
              { accountCode: '5100', side: LedgerEntrySide.DEBIT, amount: refundAmount },  // Sales Returns Expense
              { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: refundAmount }, // Revenue (Exchange new sale offsets)
            ],
          },
          ctx,
        )
        this.logger.log(`Exchange GL memo posted for return ${returnRequest.id} → new order ${newOrderId}`)
      }
    } catch (e) {
      this.logger.error(`Failed to post Exchange GL memo for return ${returnRequest.id}: ${e.message}`)
    }

    await Promise.all([
      this.cacheService.delCacheByPattern('returns:all*', tenantId),
      this.cacheService.delCacheByPattern('analytics*', tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
      this.cacheService.delCacheByPattern('pnl*', tenantId),
      this.cacheService.delCacheByPattern('cashflow*', tenantId),
      this.cacheService.delCacheByPattern('finance:summary*', tenantId),
    ])
    return updated
  }

  async updateReturnRequestStatus(
    id: string,
    ctx: RequestContextDto,
    status: ReturnStatus,
    adminComment?: string,
    refundMethod?: RefundMethod,
  ): Promise<OrderReturnEntity> {
    this.logger.log(`${this.updateReturnRequestStatus.name} Service Called`)
    const tenantId = ctx.tenantId
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)

    if (!returnRequest) {
      throw new NotFoundException('Return request not found')
    }

    const currentStatus = returnRequest.status
    const targetStatus = (status as string)?.toLowerCase() as ReturnStatus
    if (!Object.values(ReturnStatus).includes(targetStatus)) {
      throw new BadRequestException(`Invalid return status: ${status}`)
    }

    // ── Terminal state guard ──────────────────────────────────────────────────
    const terminalStatuses = [
      ReturnStatus.REFUNDED, ReturnStatus.EXCHANGED,
      ReturnStatus.REJECTED, ReturnStatus.CANCELLED,
    ]
    if (terminalStatuses.includes(currentStatus)) {
      throw new BadRequestException(
        `Cannot change status of a return request that is already ${currentStatus}`,
      )
    }

    // ── Backwards transition guard ────────────────────────────────────────────
    if (
      (currentStatus === ReturnStatus.APPROVED || currentStatus === ReturnStatus.RECEIVED) &&
      targetStatus === ReturnStatus.PENDING
    ) {
      throw new BadRequestException(`Cannot move return back to pending from ${currentStatus}`)
    }

    // ── APPROVED: restock inventory ───────────────────────────────────────────
    // Restock fires on PENDING → APPROVED  OR  RECEIVED → APPROVED
    if (
      targetStatus === ReturnStatus.APPROVED &&
      (currentStatus === ReturnStatus.PENDING || currentStatus === ReturnStatus.RECEIVED)
    ) {
      await this.restockItems(returnRequest, ctx)
    }

    // ── Override refundMethod if provided at status-update time ───────────────
    if (refundMethod) {
      returnRequest.refundMethod = refundMethod
    }

    const updated = await this.returnRepository.updateStatus(returnRequest, targetStatus, adminComment)

    // ── REFUNDED: issue refund via selected method ────────────────────────────
    if (targetStatus === ReturnStatus.REFUNDED) {
      await this.processRefund(updated, ctx)
    }

    // Invalidate the admin list cache
    await Promise.all([
      this.cacheService.delCacheByPattern('returns:all*', tenantId),
      this.cacheService.delCacheByPattern('analytics*', tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
      this.cacheService.delCacheByPattern('pnl*', tenantId),
      this.cacheService.delCacheByPattern('cashflow*', tenantId),
      this.cacheService.delCacheByPattern('finance:summary*', tenantId),
    ])
    return updated
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async processRefund(returnRequest: OrderReturnEntity, ctx: RequestContextDto) {
    const refundAmount = Number(returnRequest.refundAmount || 0)
    const customerId = returnRequest.order?.userId || (returnRequest as any).userId
    const method = returnRequest.refundMethod ?? RefundMethod.STORE_CREDIT

    if (refundAmount <= 0) {
      this.logger.warn(
        `Return ${returnRequest.id} marked REFUNDED but refundAmount=${refundAmount} — skipping refund action`,
      )
      return
    }

    switch (method) {
      case RefundMethod.STORE_CREDIT:
        if (!customerId) {
          this.logger.warn(
            `Return ${returnRequest.id}: STORE_CREDIT refund requested but no customerId — wallet not credited`,
          )
          return
        }
        try {
          await this.walletService.creditWallet(
            {
              customerId,
              amount: refundAmount,
              type: WalletTransactionType.STORE_CREDIT,
              referenceType: 'ORDER_RETURN',
              referenceId: returnRequest.id,
              note: `Refund for Return #${returnRequest.id.substring(0, 8)}`,
            },
            ctx,
          )
          this.logger.log(
            `Wallet credited for return ${returnRequest.id}: customer=${customerId}, amount=${refundAmount}`,
          )
        } catch (e) {
          this.logger.error(`Failed to credit wallet for return ${returnRequest.id}: ${e.message}`)
        }
        break

      case RefundMethod.CASH:
        try {
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.CASH_PAYMENT,
              description: `Cash Refund for Return #${returnRequest.id.substring(0, 8)}`,
              referenceType: 'ORDER_RETURN',
              referenceId: returnRequest.id,
              lines: [
                { accountCode: '5100', side: LedgerEntrySide.DEBIT, amount: refundAmount },  // Sales Returns/Refund Expense
                { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: refundAmount }, // Cash Asset
              ],
            },
            ctx,
          )
          this.logger.log(
            `Cash refund of ${refundAmount} authorized for return ${returnRequest.id}. Posted GL journal entry.`,
          )
        } catch (e) {
          this.logger.error(`Failed to post Cash refund GL entry for return ${returnRequest.id}: ${e.message}`)
        }
        break

      case RefundMethod.CARD:
        try {
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.CASH_PAYMENT,
              description: `Card Refund (Gateway Reversal) for Return #${returnRequest.id.substring(0, 8)}`,
              referenceType: 'ORDER_RETURN',
              referenceId: returnRequest.id,
              lines: [
                { accountCode: '5100', side: LedgerEntrySide.DEBIT, amount: refundAmount },  // Sales Returns/Refund Expense
                { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: refundAmount }, // Cash/Bank Asset
              ],
            },
            ctx,
          )
          this.logger.log(
            `Card refund of ${refundAmount} required for return ${returnRequest.id}. Gateway reversal simulated & GL journal entry posted.`,
          )
        } catch (e) {
          this.logger.error(`Failed to post Card refund GL entry for return ${returnRequest.id}: ${e.message}`)
        }
        break

      case RefundMethod.MOBILE:
        try {
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.CASH_PAYMENT,
              description: `Mobile Payment Refund for Return #${returnRequest.id.substring(0, 8)}`,
              referenceType: 'ORDER_RETURN',
              referenceId: returnRequest.id,
              lines: [
                { accountCode: '5100', side: LedgerEntrySide.DEBIT, amount: refundAmount },  // Sales Returns/Refund Expense
                { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: refundAmount }, // Cash/Bank Asset
              ],
            },
            ctx,
          )
          this.logger.log(
            `Mobile payment refund of ${refundAmount} required for return ${returnRequest.id}. Mobile wallet reversal simulated & GL journal entry posted.`,
          )
        } catch (e) {
          this.logger.error(`Failed to post Mobile refund GL entry for return ${returnRequest.id}: ${e.message}`)
        }
        break

      case RefundMethod.BANK_TRANSFER:
        try {
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.CASH_PAYMENT,
              description: `Bank Transfer Refund for Return #${returnRequest.id.substring(0, 8)}`,
              referenceType: 'ORDER_RETURN',
              referenceId: returnRequest.id,
              lines: [
                { accountCode: '5100', side: LedgerEntrySide.DEBIT, amount: refundAmount },  // Sales Returns/Refund Expense
                { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: refundAmount }, // Cash/Bank Asset
              ],
            },
            ctx,
          )
          this.logger.log(
            `Bank transfer refund of ${refundAmount} required for return ${returnRequest.id}. Manual bank transfer simulated & GL journal entry posted.`,
          )
        } catch (e) {
          this.logger.error(`Failed to post Bank Transfer refund GL entry for return ${returnRequest.id}: ${e.message}`)
        }
        break

      default:
        this.logger.warn(`Unknown refund method ${method} for return ${returnRequest.id}`)
    }
  }

  private async restockItems(returnRequest: OrderReturnEntity, ctx: RequestContextDto) {
    this.logger.log(`${this.restockItems.name} Service Called`)
    for (const item of returnRequest.items) {
      await this.inventoryService.createLedgerEntry(
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          type: InventoryTransactionType.RETURN,
          referenceType: InventoryTransactionReferenceType.SALES_RETURN,
          referenceId: returnRequest.id,
        },
        ctx,
      )
    }
  }
}
