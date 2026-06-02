import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { StockReservationEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-reservation.entity'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { CouponService } from '@/modules/admin/sales/coupon/services/coupon.service'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { FilterOrderDto } from '@/modules/admin/sales/order/dto/filter-order.dto'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { CartService } from '@/modules/store/cart/cart.service'
import { ShippingAddressService } from '@/modules/store/shipping-address/shipping-address.service'
import { InjectQueue } from '@nestjs/bullmq'
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import { FulfillmentService } from '@/modules/admin/operations/logistics/fulfillment/fulfillment.service'
import { Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { PaymentEntity } from '../../payment/entities/payment.entity'
import { PaymentRepository } from '../../payment/repositoris/payment.repository'
import { OrderRepository } from '../repositoris/order.repository'
import { OrderProcessHelper } from './order-process.helper'

import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { ArService } from '@/modules/admin/operations/finance/accounting/services/ar.service'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { LoyaltyService } from '@/modules/admin/marketing/loyalty/services/loyalty.service'
import { ReferralService } from '@/modules/admin/marketing/loyalty/services/referral.service'

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private cartService: CartService,
    private readonly inventoryService: InventoryLedgerService,
    private readonly reservationService: StockReservationService,
    private readonly dataSource: DataSource,
    private readonly couponService: CouponService,
    private readonly invoiceService: InvoiceService,
    private readonly shippingAddressService: ShippingAddressService,
    private readonly cacheService: CacheService,
    private readonly orderProcessHelper: OrderProcessHelper,
    @InjectQueue('order') private readonly orderQueue: Queue,
    private readonly fulfillmentService: FulfillmentService,
    private readonly notificationService: NotificationService,
    private readonly arService: ArService,
    private readonly accountingService: AccountingService,
    private readonly walletService: WalletService,
    private readonly loyaltyService: LoyaltyService,
    private readonly referralService: ReferralService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    ctx: RequestContextDto,
  ): Promise<{ message: string; success: boolean; order: OrderEntity }> {
    this.logger.log(`${this.createOrder.name} Service Called`)
    const tenantId = ctx.tenantId

    const result = await this.dataSource.transaction(async (manager) => {
      // 1. Initial Data Fetching
      const settings = await manager.findOne(SiteSettingsEntity, { where: { tenantId } })

      const targetUserId = createOrderDto.userId || ctx.userId
      const user = targetUserId
        ? await manager.findOne(UserEntity, { where: { id: targetUserId, tenantId } })
        : null
      // 2. Address Resolution
      let resolvedAddress = createOrderDto.address
      if (createOrderDto.shippingAddressId && createOrderDto.userId) {
        try {
          const savedAddress = await this.shippingAddressService.findShippingAddress(
            createOrderDto.shippingAddressId,
            ctx,
          )
          resolvedAddress = `${savedAddress.recipientName}, ${savedAddress.address}${savedAddress.city ? ', ' + savedAddress.city : ''}`
        } catch (err) {
          this.logger.error('Failed to resolve shipping address', err)
        }
      }

      // 3. Resolve Items Source (Direct vs Cart)
      let rawItems = []
      let preCouponTotal = 0
      let cartId = null

      if (createOrderDto.items && createOrderDto.items.length > 0) {
        rawItems = createOrderDto.items
      } else if (user?.id) {
        const cart = await this.cartService.createOrGetCart(ctx)
        if (!cart.items || cart.items.length === 0) {
          throw new BadRequestException('Order must contain at least one item')
        }
        rawItems = cart.items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          pricing: item.pricing,
        }))
        preCouponTotal = cart.summary.subtotal - cart.summary.offer_discount
        cartId = (cart as any).id
      } else {
        throw new BadRequestException(
          'Invalid order source: no items provided and no user cart found.',
        )
      }

      // 4. Transform & Deduct Stock
      // Collect ledger entry IDs and reservation IDs as they are created so we can
      // link them to the order ID precisely after save — avoiding race conditions.
      const processedItems: OrderItemEntity[] = []
      const pendingLedgerIds: string[] = []
      const pendingReservationIds: string[] = []
      const resolvedPriceBookCode = createOrderDto.priceBookCode || user?.priceBookCode || null
      for (const item of rawItems) {
        const { orderItem, ledgerEntryId, reservationId } =
          await this.orderProcessHelper.processItem(
            item,
            ctx,
            manager,
            resolvedPriceBookCode, // forward resolved book
          )
        processedItems.push(orderItem)
        if (ledgerEntryId) pendingLedgerIds.push(ledgerEntryId)
        if (reservationId) pendingReservationIds.push(reservationId)
      }

      // Determine Subtotal if not already set by Cart
      if (!preCouponTotal) {
        preCouponTotal = processedItems.reduce((acc, item) => acc + item.totalAmount, 0)
      }

      // 5. Create Order Entity
      const order = manager.create(OrderEntity, {
        customerName: createOrderDto.customerName,
        customerEmail: createOrderDto.customerEmail,
        customerPhone: createOrderDto.customerPhone,
        address: resolvedAddress,
        shippingAddressId: createOrderDto.shippingAddressId || undefined,
        items: processedItems,
        totalAmount: 0,
        currency: createOrderDto.currency || settings?.currency || 'USD',
        currencyRate: createOrderDto.currencyRate || 1,
        paymentMethod: createOrderDto.paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderNotes: createOrderDto.orderNotes,
        userId: ctx.userId || user?.id,
        tenantId,
        deliveryZone: createOrderDto.shippingZone,
      })

      // 6. Apply Discounts & Shipping
      const { couponDiscountAmount, isFreeShipping } = await this.orderProcessHelper.applyCoupon(
        order,
        preCouponTotal,
        createOrderDto.appliedCouponCode,
        ctx,
        manager,
      )

      const shippingFee = await this.orderProcessHelper.calculateShipping(
        preCouponTotal - couponDiscountAmount,
        isFreeShipping,
        createOrderDto,
        settings,
        ctx,
      )

      order.shippingFee = shippingFee
      order.totalAmount = preCouponTotal - couponDiscountAmount + shippingFee
      order.taxAmount = processedItems.reduce(
        (acc, item) => acc + Number(item.taxAmount) * item.quantity,
        0,
      )

      // 7. B2B Credit Limit Verification
      if (order.paymentMethod === PaymentMethod.ON_ACCOUNT) {
        if (!user) {
          throw new BadRequestException('B2B credit checkouts require a valid User account')
        }
        if (user.creditHold) {
          throw new BadRequestException(
            'Checkout blocked: This account is currently on credit hold',
          )
        }
        const currentOutstanding = await this.arService.getCustomerOutstandingBalance(
          user.id,
          tenantId,
          manager,
        )
        const orderTotal = Number(order.totalAmount)
        const limit = Number(user.creditLimit || 0)
        if (currentOutstanding + orderTotal > limit) {
          throw new BadRequestException(
            `Checkout blocked: Order total ($${orderTotal}) exceeds credit limit ($${limit}) with current outstanding debt ($${currentOutstanding})`,
          )
        }
      }

      // 8. Persist Order
      const savedOrder = await manager.save(order)

      // 8.5 Wallet Balance Deduction (within the same atomic transaction)
      if (createOrderDto.useWalletBalance && (ctx.userId || user?.id)) {
        const walletUserId = ctx.userId || user?.id
        const availableBalance = await this.walletService.getAvailableBalance(
          walletUserId,
          tenantId,
          manager,
        )
        if (availableBalance > 0) {
          const deductAmount = createOrderDto.walletAmountToUse
            ? Math.min(
                Number(createOrderDto.walletAmountToUse),
                availableBalance,
                Number(savedOrder.totalAmount),
              )
            : Math.min(availableBalance, Number(savedOrder.totalAmount))

          if (deductAmount > 0) {
            await this.walletService.debitWallet(
              {
                customerId: walletUserId,
                amount: deductAmount,
                referenceType: 'ORDER',
                referenceId: savedOrder.id,
                note: `Wallet payment for Order #${savedOrder.id.substring(0, 8)}`,
                skipGlPost: true,
              },
              ctx,
              manager,
            )
            savedOrder.walletDeductionAmount = deductAmount
            // Mark order as paid if wallet covers the full amount
            if (deductAmount >= Number(savedOrder.totalAmount)) {
              savedOrder.paymentStatus = PaymentStatus.PAID
            }
            await manager.save(OrderEntity, savedOrder)
          }
        }
      }

      // 9. Post Accounts Receivable and General Ledger Entries
      if (savedOrder.paymentMethod === PaymentMethod.ON_ACCOUNT) {
        const orderTotal = Number(savedOrder.totalAmount)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30) // Default Net 30 Terms

        const walletDeduction = Number(savedOrder.walletDeductionAmount || 0)
        const remainingAmount = orderTotal - walletDeduction
        const taxAmount = Number(savedOrder.taxAmount || 0)
        const netRevenue = orderTotal - taxAmount

        // Post AR Sub-ledger Invoice Entry
        await this.arService.postArTransaction(
          {
            customerId: user.id,
            type: ArTransactionType.INVOICE,
            amount: remainingAmount,
            referenceType: 'ORDER',
            referenceId: savedOrder.id,
            dueDate,
            currency: savedOrder.currency,
          },
          ctx,
          manager,
        )

        const lines = []
        if (walletDeduction > 0) {
          lines.push({ accountCode: '2300', side: LedgerEntrySide.DEBIT, amount: walletDeduction })
        }
        if (remainingAmount > 0) {
          lines.push({ accountCode: '1200', side: LedgerEntrySide.DEBIT, amount: remainingAmount })
        }
        if (netRevenue > 0) {
          lines.push({ accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: netRevenue })
        }
        if (taxAmount > 0) {
          lines.push({ accountCode: '2200', side: LedgerEntrySide.CREDIT, amount: taxAmount })
        }

        // Post General Ledger Double-Entry
        await this.accountingService.createJournalEntry(
          {
            type: JournalType.SALES,
            description: `B2B Credit Sale - Net 30 Terms - Order ID: ${savedOrder.id}`,
            referenceType: 'ORDER',
            referenceId: savedOrder.id,
            lines,
          },
          ctx,
          manager,
        )
      }

      // 8. Link Inventory Transactions
      // Update ONLY the ledger rows that belong to this order (identified by
      // their primary keys collected above). This is safe under concurrent
      // order creation — no row from another in-flight order can be matched.
      if (pendingLedgerIds.length > 0) {
        await manager
          .createQueryBuilder()
          .update(InventoryLedgerEntity)
          .set({ referenceId: savedOrder.id })
          .whereInIds(pendingLedgerIds)
          .execute()
      }

      // Backfill orderId on the stock_reservations rows now that the order ID is known.
      if (pendingReservationIds.length > 0) {
        await manager
          .createQueryBuilder()
          .update(StockReservationEntity)
          .set({ orderId: savedOrder.id })
          .whereInIds(pendingReservationIds)
          .execute()
      }

      // 9. Cleanup
      if (cartId && user?.id) {
        await this.cartService.clearCart(ctx)
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

      const finalOrder = await manager.findOne(OrderEntity, {
        where: { id: savedOrder.id, tenantId },
        relations: ['items', 'items.product', 'items.variant'],
      })

      return {
        message: 'Order created successfully',
        success: true,
        order: finalOrder || savedOrder,
      }
    })

    // 10. Queue background jobs after successful transaction commit
    try {
      await this.orderQueue.add(
        'create-invoice',
        {
          orderId: result.order.id,
          tenantId,
          paymentStatus: result.order.paymentStatus,
        },
        { removeOnComplete: true },
      )

      if (result.order.paymentMethod === PaymentMethod.COD) {
        await this.orderQueue.add(
          'send-order-notification',
          {
            orderId: result.order.id,
            tenantId,
          },
          { removeOnComplete: true },
        )
      }
    } catch (jobError) {
      this.logger.error('Failed to enqueue order background jobs', jobError)
    }

    return result
  }

  async findAllOrders(
    filterDto: FilterOrderDto,
    ctx: RequestContextDto,
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    this.logger.log(`${this.findAllOrders.name} Service Called`)
    const tenantId = ctx.tenantId
    const page = filterDto.page ? Number(filterDto.page) : 1
    const limit = filterDto.limit ? Number(filterDto.limit) : 20
    return await this.orderRepository.findAllOrders(
      {
        ...filterDto,
        page,
        limit,
      },
      tenantId,
    )
  }

  async findOneOrder(id: string, ctx: RequestContextDto): Promise<OrderEntity> {
    this.logger.log(`${this.findOneOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.orderRepository.findOrderById(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOneForCourier(id: string, ctx: RequestContextDto): Promise<OrderEntity> {
    this.logger.log(`${this.findOneForCourier.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.orderRepository.findOneForCourier(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOrderByTrackingId(trackingId: string): Promise<OrderEntity | null> {
    return await this.orderRepository.findOrderByTrackingId(trackingId)
  }

  async findOrderByInvoiceCode(invoiceCode: string): Promise<OrderEntity | null> {
    return await this.orderRepository.findOrderByInvoiceCode(invoiceCode)
  }

  async findByUserId(
    userId: string,
    ctx: RequestContextDto,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    this.logger.log(`${this.findByUserId.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.orderRepository.findByUserIdPaginated(userId, tenantId, page, limit, search)
  }

  async countByUserId(userId: string, ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByUserId.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.orderRepository.countByUserId(userId, tenantId)
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    ctx: RequestContextDto,
  ): Promise<OrderEntity> {
    this.logger.log(`${this.updateOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.findOneOrder(id, ctx)

    // Using query runner for business transaction
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

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
          const payment = await this.paymentRepository.createAndSave(
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
        if (savedOrder.paymentMethod !== PaymentMethod.ON_ACCOUNT) {
          const orderTotal = Number(savedOrder.totalAmount)
          const walletDeduction = Number(savedOrder.walletDeductionAmount || 0)
          const remainingAmount = orderTotal - walletDeduction
          const taxAmount = Number(savedOrder.taxAmount || 0)
          const netRevenue = orderTotal - taxAmount

          const lines = []
          if (walletDeduction > 0) {
            lines.push({
              accountCode: '2300',
              side: LedgerEntrySide.DEBIT,
              amount: walletDeduction,
            })
          }
          if (remainingAmount > 0) {
            lines.push({
              accountCode: '1000',
              side: LedgerEntrySide.DEBIT,
              amount: remainingAmount,
            })
          }
          if (netRevenue > 0) {
            lines.push({ accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: netRevenue })
          }
          if (taxAmount > 0) {
            lines.push({ accountCode: '2200', side: LedgerEntrySide.CREDIT, amount: taxAmount })
          }

          await this.accountingService.createJournalEntry(
            {
              type: JournalType.SALES,
              description: `Sales Revenue & Cash Recognition - Order ID: ${savedOrder.id}`,
              referenceType: 'ORDER',
              referenceId: savedOrder.id,
              lines,
            },
            ctx,
            queryRunner.manager,
          )
        }
      }

      // Sync Invoice Status
      if (updateOrderDto.paymentStatus === PaymentStatus.PAID) {
        await this.invoiceService.updateInvoiceStatusByOrderId(id, InvoiceStatus.PAID, ctx)
      } else if (updateOrderDto.status === OrderStatus.CANCELLED) {
        await this.invoiceService.updateInvoiceStatusByOrderId(id, InvoiceStatus.CANCELLED, ctx)
      }

      // Check for Order Confirmation to Trigger Fulfillment
      if (updateOrderDto.status === OrderStatus.CONFIRMED && oldStatus !== OrderStatus.CONFIRMED) {
        await this.fulfillmentService.createFromOrder(id, ctx)
      }

      await queryRunner.commitTransaction()

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
              link: `/admin/sales/orders/${savedOrder.id}`,
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
              link: `/admin/sales/orders/${savedOrder.id}`,
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
              link: `/admin/sales/orders/${savedOrder.id}`,
              userId: null as any,
            },
            tenantId,
          )
        }
      } catch (e) {
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
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.orderRepository.countByTenant(tenantId)
  }

  async orderOverview(ctx?: RequestContextDto): Promise<{
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    cancelledOrders: number
  }> {
    const tenantId = ctx?.tenantId
    const cacheKey = 'orders:overview'
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.orderRepository.orderOverview(tenantId),
      300,
      tenantId,
    )
  }
}
