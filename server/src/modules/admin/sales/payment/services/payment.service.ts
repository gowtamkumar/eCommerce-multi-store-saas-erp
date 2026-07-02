import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { PaymentStrategyFactory } from '@/common/strategies/payment/payment-strategy.factory'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InitPaymentDto } from '../dto/payment.dto'
import { PaymentEntity } from '../entities/payment.entity'
import { PaymentRepository } from '../repositories/payment.repository'

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private settingsService: SettingsService,
    private invoiceService: InvoiceService,
    private mailService: MailService,
    private readonly cacheService: CacheService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource,
  ) {}

  async initPayment(dto: InitPaymentDto, ctx: RequestContextDto): Promise<{ gatewayUrl: string }> {
    this.logger.log(`${this.initPayment.name} Service Called`)
    const storeId = ctx.storeId
    const { orderId, callbackUrl } = dto

    const order = await this.orderRepository.findOrderById(orderId, storeId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    this.validatePaymentMethodForCurrency(order.paymentMethod, order.currency)

    const settings = await this.settingsService.findByStoreSettings(ctx)
    const strategy = PaymentStrategyFactory.create(order.paymentMethod)

    const result = await strategy.initiate(order, settings, {
      callbackUrl,
      storeId,
    })

    if (result.success) {
      if (result.transactionId) {
        order.transactionId = result.transactionId
        await this.orderRepository.saveOrder(order)
      }
      return { gatewayUrl: result.gatewayUrl }
    } else {
      throw new BadRequestException(result.error || 'Failed to initiate payment')
    }
  }

  validatePaymentMethodForCurrency(method: string | PaymentMethod, currency: string): void {
    const upperCurrency = (currency || '').toUpperCase()
    if (method === PaymentMethod.SSLCOMMERZ && upperCurrency !== 'BDT') {
      throw new BadRequestException('SSLCommerz only supports BDT currency transactions.')
    }
    if (
      (method === PaymentMethod.STRIPE || method === PaymentMethod.PAYPAL) &&
      upperCurrency === 'BDT'
    ) {
      throw new BadRequestException(
        `${method.toUpperCase()} does not support BDT currency transactions.`,
      )
    }
  }

  async getStrategyByTransactionId(
    tran_id: string,
  ): Promise<{ strategy: any; order: OrderEntity }> {
    const order = await this.orderRepository.findOrderByTransactionId(tran_id)
    if (!order) throw new NotFoundException('Order not found')
    return {
      strategy: PaymentStrategyFactory.create(order.paymentMethod),
      order,
    }
  }

  async handleSuccessPayment(tran_id: string, gatewayResponse: any): Promise<{ success: boolean }> {
    this.logger.log(`${this.handleSuccessPayment.name} Service Called`)
    const { strategy, order } = await this.getStrategyByTransactionId(tran_id)

    // Idempotency: never re-mark a paid order as paid (or attempt validation
    // again) — the callback can fire multiple times legitimately.
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { success: true }
    }

    let verifiedGatewayResponse: any = gatewayResponse

    if (typeof strategy.verifyTransaction === 'function') {
      // Per-store gateway: load store payment credentials.
      const settings = await this.settingsService.findByStoreSettings({
        storeId: order.storeId,
      } as RequestContextDto)
      const verification = await strategy.verifyTransaction({
        valId:
          gatewayResponse?.val_id ??
          gatewayResponse?.value_id ??
          gatewayResponse?.['VAL_ID'] ??
          gatewayResponse?.session_id ??
          gatewayResponse?.token,
        transactionId: tran_id,
        storeId:
          (settings as any)?.payment?.sslCommerzStoreId ||
          (settings as any)?.payment?.paypalClientId,
        storePassword:
          (settings as any)?.payment?.sslCommerzStorePassword ||
          (settings as any)?.payment?.stripeSecretKey ||
          (settings as any)?.payment?.paypalClientSecret,
        isSandbox:
          !!(settings as any)?.payment?.sslCommerzIsSandbox ||
          (settings as any)?.payment?.paypalMode === 'sandbox',
        expectedAmount: Number(order.totalAmount) / (Number(order.currencyRate) || 1),
        expectedCurrency: order.currency || 'BDT',
      })

      if (!verification.success) {
        this.logger.warn(
          `Payment verification failed for tran_id=${tran_id} reason=${verification.reason}`,
        )
        return { success: false }
      }
      verifiedGatewayResponse = verification.gatewayResponse ?? gatewayResponse
    } else {
      const validation = await strategy.validateCallback(gatewayResponse)
      if (!validation.success) {
        this.logger.warn(`Payment validation failed for tran_id: ${tran_id}`)
        return { success: false }
      }
      verifiedGatewayResponse = validation.gatewayResponse
    }

    // Atomically flip the order to PAID and record the payment under a row
    // lock. The gateway can fire concurrent/duplicate callbacks; the lock +
    // re-check inside the transaction prevents double payments and double
    // accounting postings.
    const { payment, alreadyPaid } = await this.dataSource.transaction(async (manager) => {
      const lockedOrder = await manager.findOne(OrderEntity, {
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
      })
      if (!lockedOrder) {
        throw new NotFoundException('Order not found')
      }
      if (lockedOrder.paymentStatus === PaymentStatus.PAID) {
        return { payment: null as PaymentEntity | null, alreadyPaid: true }
      }

      // Reuse an existing payment row for this transaction if one exists.
      const existingPayment = await manager.findOne(PaymentEntity, {
        where: { transactionId: tran_id, storeId: lockedOrder.storeId },
      })

      lockedOrder.paymentStatus = PaymentStatus.PAID
      lockedOrder.status = OrderStatus.PENDING
      await manager.save(lockedOrder)

      const savedPayment =
        existingPayment ||
        (await this.paymentRepository.createAndSave(
          {
            orderId: order.id,
            transactionId: tran_id,
            amount: order.totalAmount,
            currency: order.currency,
            method: order.paymentMethod || PaymentMethod.SSLCOMMERZ,
            status: PaymentStatus.COMPLETED,
            gatewayResponse: verifiedGatewayResponse,
          },
          { storeId: order.storeId, userId: order.userId } as RequestContextDto,
          manager,
        ))

      return { payment: savedPayment, alreadyPaid: false }
    })

    // A concurrent callback already finalized this order — nothing more to do.
    if (alreadyPaid || !payment) {
      return { success: true }
    }

    // Sync Invoice Status
    await this.invoiceService.updateInvoiceStatusByOrderId(
      order.id,
      InvoiceStatus.PAID,
      { storeId: order.storeId } as RequestContextDto, // Mocking ctx since we don't have it inside webhook handlers
    )

    // Notify Admin
    const orderWithRelations = await this.orderRepository.findOrderById(order.id, order.storeId)
    if (orderWithRelations) {
      this.mailService.sendNewOrderNotification(orderWithRelations, order.storeId)
    }

    await this.notifyPaymentEvent(
      order,
      'Payment Received',
      `Payment received for Order #${order.id.substring(0, 8)}.`,
      'SUCCESS',
    )

    await Promise.all([
      this.cacheService.delCacheByPattern('payments:list*', order.storeId),
      this.cacheService.delCacheByPattern('analytics*', order.storeId),
      this.cacheService.delCacheByPattern('dashboard*', order.storeId),
      this.cacheService.delCacheByPattern('pnl*', order.storeId),
      this.cacheService.delCacheByPattern('cashflow*', order.storeId),
      this.cacheService.delCacheByPattern('finance:summary*', order.storeId),
      this.cacheService.delCacheByPattern('ledger:customer*', order.storeId),
    ])

    await this.auditLogService.log(
      { storeId: order.storeId, userId: order.userId } as RequestContextDto,
      {
        action: 'PAYMENT_SUCCESS',
        entity: 'Payment',
        entityId: payment.id,
        newValue: {
          orderId: order.id,
          transactionId: tran_id,
          amount: order.totalAmount,
          currency: order.currency,
          status: PaymentStatus.COMPLETED,
        },
      },
    )
    return { success: true }
  }

  async handleFailPayment(tran_id: string, gatewayResponse: any): Promise<{ success: boolean }> {
    this.logger.log(`${this.handleFailPayment.name} Service Called`)
    const { strategy, order } = await this.getStrategyByTransactionId(tran_id)
    const validation = await strategy.validateCallback(gatewayResponse)

    // Wrap in a transaction with a pessimistic write lock — failure callbacks can
    // arrive concurrently from the gateway and must not create duplicate PaymentEntity rows.
    const payment = await this.dataSource.transaction(async (manager) => {
      const lockedOrder = await manager.findOne(OrderEntity, {
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
      })
      if (!lockedOrder) throw new Error('Order not found')

      // Idempotency: already marked failed by a concurrent callback
      if (lockedOrder.paymentStatus === PaymentStatus.FAILED) {
        return null
      }

      lockedOrder.paymentStatus = PaymentStatus.FAILED
      await manager.save(lockedOrder)

      const existingPayment = await manager.findOne(PaymentEntity, {
        where: { transactionId: tran_id, storeId: lockedOrder.storeId },
      })
      if (existingPayment) return existingPayment

      return this.paymentRepository.createAndSave(
        {
          orderId: order.id,
          transactionId: tran_id,
          amount: order.totalAmount,
          currency: order.currency,
          method: order.paymentMethod || PaymentMethod.SSLCOMMERZ,
          status: PaymentStatus.FAILED,
          gatewayResponse: validation.gatewayResponse,
        },
        { storeId: order.storeId, userId: order.userId } as RequestContextDto,
        manager,
      )
    })
    if (!payment) return { success: false }

    await Promise.all([
      this.cacheService.delCacheByPattern('payments:list*', order.storeId),
      this.cacheService.delCacheByPattern('analytics*', order.storeId),
      this.cacheService.delCacheByPattern('dashboard*', order.storeId),
      this.cacheService.delCacheByPattern('pnl*', order.storeId),
      this.cacheService.delCacheByPattern('cashflow*', order.storeId),
      this.cacheService.delCacheByPattern('finance:summary*', order.storeId),
      this.cacheService.delCacheByPattern('ledger:customer*', order.storeId),
    ])

    await this.auditLogService.log(
      { storeId: order.storeId, userId: order.userId } as RequestContextDto,
      {
        action: 'PAYMENT_FAILED',
        entity: 'Payment',
        entityId: payment.id,
        newValue: {
          orderId: order.id,
          transactionId: tran_id,
          amount: order.totalAmount,
          currency: order.currency,
          status: PaymentStatus.FAILED,
        },
      },
    )

    await this.notifyPaymentEvent(
      order,
      'Payment Failed',
      `Payment failed for Order #${order.id.substring(0, 8)}.`,
      'DANGER',
    )
    return { success: false }
  }

  async handleCancelPayment(
    tran_id: string,
    gatewayResponse: any,
  ): Promise<{ cancelled: boolean }> {
    this.logger.log(`${this.handleCancelPayment.name} Service Called`)
    const { strategy, order } = await this.getStrategyByTransactionId(tran_id)
    const validation = await strategy.validateCallback(gatewayResponse)

    // Customer cancelled the payment session — revert order to PENDING so they can retry.
    // Record with CANCELLED status (not PENDING) so it's distinguishable in the payment ledger.
    order.paymentStatus = PaymentStatus.PENDING
    await this.orderRepository.saveOrder(order)

    // Record payment cancellation with proper CANCELLED status
    const payment = await this.paymentRepository.createAndSave(
      {
        orderId: order.id,
        transactionId: tran_id,
        amount: order.totalAmount,
        currency: order.currency,
        method: order.paymentMethod || PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.CANCELLED,
        gatewayResponse: validation.gatewayResponse,
      },
      { storeId: order.storeId, userId: order.userId } as RequestContextDto,
    )

    await Promise.all([
      this.cacheService.delCacheByPattern('payments:list*', order.storeId),
      this.cacheService.delCacheByPattern('analytics*', order.storeId),
      this.cacheService.delCacheByPattern('dashboard*', order.storeId),
      this.cacheService.delCacheByPattern('pnl*', order.storeId),
      this.cacheService.delCacheByPattern('cashflow*', order.storeId),
      this.cacheService.delCacheByPattern('finance:summary*', order.storeId),
      this.cacheService.delCacheByPattern('ledger:customer*', order.storeId),
    ])

    await this.auditLogService.log(
      { storeId: order.storeId, userId: order.userId } as RequestContextDto,
      {
        action: 'PAYMENT_CANCELLED',
        entity: 'Payment',
        entityId: payment.id,
        newValue: {
          orderId: order.id,
          transactionId: tran_id,
          amount: order.totalAmount,
          currency: order.currency,
          status: PaymentStatus.PENDING,
        },
      },
    )

    await this.notifyPaymentEvent(
      order,
      'Payment Cancelled',
      `Payment was cancelled for Order #${order.id.substring(0, 8)}.`,
      'WARNING',
    )
    return { cancelled: true }
  }

  private async notifyPaymentEvent(
    order: OrderEntity,
    title: string,
    message: string,
    type: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification(
        {
          title,
          message,
          type,
          link: `/admin/orders/${order.id}`,
          userId: null as any,
        },
        order.storeId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger payment notification: ${e.message}`)
    }
  }

  async getRedirectUrl(
    tran_id: string,
    gatewayResponse: any,
    defaultAppUrl: string,
  ): Promise<string> {
    const { strategy } = await this.getStrategyByTransactionId(tran_id)
    return strategy.getRedirectUrl(gatewayResponse, defaultAppUrl)
  }

  async findAllPayments(
    ctx: RequestContextDto,
    filterDto: PaginationDto & { startDate?: Date; endDate?: Date },
  ): Promise<{
    items: PaymentEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    this.logger.log(`${this.findAllPayments.name} Service Called`)
    const storeId = ctx.storeId
    const { page = 1, limit = 20, q: search, startDate, endDate } = filterDto
    const cacheKey = `payments:list:p${page}:l${limit}:${startDate?.getTime()}:${endDate?.getTime()}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.paymentRepository.findPaymentsByStore(
          storeId,
          page,
          limit,
          search,
          startDate,
          endDate,
        )
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
      },
      300,
      storeId,
    )
  }

  /**
   * Chunked payment fetch — iterates in 500-row pages to avoid loading 100k rows
   * into memory at once. Safe for large stores and report aggregation use.
   */
  async findAllPaymentsRaw(
    ctx: RequestContextDto,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PaymentEntity[]> {
    this.logger.log(`${this.findAllPaymentsRaw.name} Service Called`)
    const storeId = ctx.storeId
    const CHUNK_SIZE = 500
    const allItems: PaymentEntity[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const [items] = await this.paymentRepository.findPaymentsByStore(
        storeId,
        page,
        CHUNK_SIZE,
        undefined,
        startDate,
        endDate,
      )
      allItems.push(...items)
      hasMore = items.length === CHUNK_SIZE
      page++
    }
    return allItems
  }

  async findAllPaymentsByCustomer(
    customerId: string,
    ctx: RequestContextDto,
  ): Promise<PaymentEntity[]> {
    this.logger.log(`${this.findAllPaymentsByCustomer.name} Service Called`)
    const storeId = ctx.storeId
    return await this.paymentRepository.findPaymentsByUser(customerId, storeId)
  }
}
