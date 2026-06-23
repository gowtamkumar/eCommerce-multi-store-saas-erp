import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { StockReservationEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-reservation.entity'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { CartService } from '@/modules/store/cart/cart.service'
import { ShippingAddressService } from '@/modules/store/shipping-address/shipping-address.service'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { OrderProcessHelper } from './order-process.helper'

import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { ArService } from '@/modules/admin/operations/finance/accounting/services/ar.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'

@Injectable()
export class OrderCheckoutService {
  private readonly logger = new Logger(OrderCheckoutService.name)

  constructor(
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
    @InjectQueue('accounting') private readonly accountingQueue: Queue,
    @InjectQueue('invoice') private readonly invoiceQueue: Queue,
    private readonly shippingAddressService: ShippingAddressService,
    private readonly cacheService: CacheService,
    private readonly orderProcessHelper: OrderProcessHelper,
    @InjectQueue('order') private readonly orderQueue: Queue,
    private readonly arService: ArService,
    private readonly walletService: WalletService,
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
          const addressParts = [
            savedAddress.recipientName,
            savedAddress.address,
            savedAddress.city,
            savedAddress.state,
            savedAddress.postalCode,
            savedAddress.country,
          ].filter(Boolean)
          resolvedAddress = addressParts.join(', ')
        } catch (err: any) {
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
      const orderCurrency = createOrderDto.currency || settings?.currency || 'USD'
      const resolvedPriceBookCode = createOrderDto.priceBookCode || user?.priceBookCode || null
      for (const item of rawItems) {
        const { orderItem, ledgerEntryId, reservationId } =
          await this.orderProcessHelper.processItem(
            item,
            ctx,
            manager,
            resolvedPriceBookCode, // forward resolved book
            orderCurrency,
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
        currency: orderCurrency,
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

        await this.accountingQueue.add(
          'post-order-credit-placed',
          {
            ctx,
            payload: {
              orderId: savedOrder.id,
              walletDeduction,
              remainingAmount,
              netRevenue,
              taxAmount,
            },
          },
          { removeOnComplete: true },
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
        relations: {
          items: {
            product: true,
            variant: true,
          },
        },
      })

      return {
        message: 'Order created successfully',
        success: true,
        order: finalOrder || savedOrder,
      }
    })

    // 10. Queue background jobs after successful transaction commit
    try {
      await this.invoiceQueue.add(
        'create-invoice',
        {
          ctx,
          payload: {
            orderId: result.order.id,
            paymentStatus: result.order.paymentStatus,
          },
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
    } catch (jobError: any) {
      this.logger.error('Failed to publish order placed event / enqueue notification', jobError)
    }

    return result
  }
}
