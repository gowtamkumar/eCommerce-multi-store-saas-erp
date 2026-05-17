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
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
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
  forwardRef,
} from '@nestjs/common'
import { FulfillmentService } from '@/modules/admin/operations/logistics/fulfillment/fulfillment.service'
import { Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { PaymentEntity } from '../../payment/entities/payment.entity'
import { PaymentRepository } from '../../payment/repositoris/payment.repository'
import { OrderRepository } from '../repositoris/order.repository'
import { OrderProcessHelper } from './order-process.helper'

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private cartService: CartService,
    private readonly inventoryService: InventoryLedgerService,
    private readonly dataSource: DataSource,
    private readonly couponService: CouponService,
    private readonly invoiceService: InvoiceService,
    private readonly shippingAddressService: ShippingAddressService,
    private readonly cacheService: CacheService,
    private readonly orderProcessHelper: OrderProcessHelper,
    @InjectQueue('order') private readonly orderQueue: Queue,
    @Inject(forwardRef(() => FulfillmentService))
    private readonly fulfillmentService: FulfillmentService,
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

      const user = createOrderDto.userId
        ? await manager.findOne(UserEntity, { where: { id: createOrderDto.userId, tenantId } })
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
      const processedItems: OrderItemEntity[] = []
      for (const item of rawItems) {
        const orderItem = await this.orderProcessHelper.processItem(item, ctx, manager)
        processedItems.push(orderItem)
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

      // 7. Persist Order
      const savedOrder = await manager.save(order)

      // 8. Link Inventory Transactions
      await manager.update(
        InventoryLedgerEntity,
        { referenceType: InventoryTransactionReferenceType.ORDER, referenceId: null, tenantId },
        { referenceId: savedOrder.id },
      )

      // 9. Cleanup
      if (cartId && user?.id) {
        await this.cartService.clearCart(ctx)
      }

      await this.cacheService.delCache('orders:overview', tenantId)

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

  async findAllOrders(filterDto: FilterOrderDto, ctx: RequestContextDto): Promise<{ orders: OrderEntity[]; total: number }> {
    this.logger.log(`${this.findAllOrders.name} Service Called`)
    const tenantId = ctx.tenantId
    const page = filterDto.page ? Number(filterDto.page) : 1
    const limit = filterDto.limit ? Number(filterDto.limit) : 20
    return await this.orderRepository.findAllOrders({
      ...filterDto,
      page,
      limit,
    }, tenantId)
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
        }
      }

      // Check for Order Completion - removed old deduction logic here since it's now deducted at creation

      Object.assign(order, updateOrderDto)
      const savedOrder = await queryRunner.manager.save(order)

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
      await this.cacheService.delCache('orders:overview', tenantId)
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
    const cacheKey = tenantId ? `orders:overview:${tenantId}` : 'orders:overview:global'
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.orderRepository.orderOverview(tenantId),
      300,
      tenantId,
    )
  }
}
