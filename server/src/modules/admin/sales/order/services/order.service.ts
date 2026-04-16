import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { OrderStrategyFactory } from '@/common/strategies/order/order-strategy.factory'
import {
  OrderCreationContext,
  OrderServiceDependencies,
} from '@/common/strategies/order/order-strategy.interface'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { InvoiceEntity } from '@/modules/admin/operations/finance/invoice/entities/invoice.entity'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { InventoryTransactionEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-transaction.entity'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { CouponService } from '@/modules/admin/sales/coupon/services/coupon.service'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { CartService } from '@/modules/store/cart/cart.service'
import { ShippingAddressService } from '@/modules/store/shipping-address/shipping-address.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PaymentEntity } from '../../payment/entities/payment.entity'
import { PaymentRepository } from '../../payment/repositoris/payment.repository'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { OrderRepository } from '../repositoris/order.repository'


@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private cartService: CartService,
    private readonly inventoryService: InventoryTransactionService,
    private readonly dataSource: DataSource,
    private readonly couponService: CouponService,
    private readonly invoiceService: InvoiceService,
    private readonly shippingAddressService: ShippingAddressService,
    private readonly cacheService: CacheService,
    @InjectQueue('order') private readonly orderQueue: Queue,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto, tenantId: string): Promise<{ message: string; success: boolean; order: OrderEntity }> {
    this.logger.log(`${this.createOrder.name} Service Called`)

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
            createOrderDto.userId,
            tenantId,
          )
          resolvedAddress = `${savedAddress.recipientName}, ${savedAddress.address}${savedAddress.city ? ', ' + savedAddress.city : ''}`
        } catch (err) {
          this.logger.error('Failed to resolve shipping address', err)
        }
      }

      console.log("Initialize Context & Strategy up");
      // 3. Initialize Context & Strategy
      const context: OrderCreationContext = { tenantId, manager, user, settings }
      const deps: OrderServiceDependencies = {
        cartService: this.cartService,
        inventoryService: this.inventoryService,
        couponService: this.couponService,
      }
      console.log("Initialize Context & Strategy");
      const strategy = OrderStrategyFactory.create(createOrderDto)
      // 4. Resolve Items
      const processedItems = await strategy.resolveItems(createOrderDto, context, deps)
      // 5. Initialize Order Entity
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
        userId: user?.id,
        tenantId,
        deliveryZone: createOrderDto.shippingZone,
      })

      // 6. Calculate Totals (includes Coupons & Shipping)
      await strategy.calculateTotals(order, processedItems, createOrderDto, context, deps)

      // 7. Save Order
      const savedOrder = await manager.save(order)

      // 8. Update Inventory Transactions with order reference ID
      await manager.update(
        InventoryTransactionEntity,
        { referenceType: InventoryTransactionReferenceType.ORDER, referenceId: null, tenantId },
        { referenceId: savedOrder.id },
      )

      // 9. Post-Order Processing
      if (user?.id && !createOrderDto.items) {
        await this.cartService.clearCart(user.id, tenantId)
      }

      const finalOrder = await manager.findOne(OrderEntity, {
        where: { id: savedOrder.id, tenantId },
        relations: ['items', 'items.product', 'items.variant'],
      })

      await this.cacheService.delCache('orders:overview', tenantId)

      return { message: 'Order created successfully', success: true, order: finalOrder || savedOrder }

    })

    // 10. Queue background jobs after successful transaction commit
    try {
      await this.orderQueue.add('create-invoice', {
        orderId: result.order.id,
        tenantId,
        paymentStatus: result.order.paymentStatus
      }, { removeOnComplete: true })

      if (result.order.paymentMethod === PaymentMethod.COD) {
        await this.orderQueue.add('send-order-notification', {
          orderId: result.order.id,
          tenantId
        }, { removeOnComplete: true })
      }
    } catch (jobError) {
      this.logger.error('Failed to enqueue order background jobs', jobError)
    }

    return result
  }

  async findAllOrders(filterDto: any, tenantId: string): Promise<{ orders: OrderEntity[]; total: number }> {
    this.logger.log(`${this.findAllOrders.name} Service Called`)
    return await this.orderRepository.findAllOrders(filterDto, tenantId)
  }

  async findOneOrder(id: string, tenantId: string): Promise<OrderEntity> {
    this.logger.log(`${this.findOneOrder.name} Service Called`)
    const order = await this.orderRepository.findOrderById(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOneForCourier(id: string, tenantId: string): Promise<OrderEntity> {
    this.logger.log(`${this.findOneForCourier.name} Service Called`)
    const order = await this.orderRepository.findOneForCourier(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findByUserId(
    userId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ orders: OrderEntity[], total: number }> {
    this.logger.log(`${this.findByUserId.name} Service Called`)
    return await this.orderRepository.findByUserIdPaginated(userId, tenantId, page, limit, search)
  }

  async countByUserId(userId: string, tenantId: string): Promise<number> {
    this.logger.log(`${this.countByUserId.name} Service Called`)
    return await this.orderRepository.countByUserId(userId, tenantId)
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto, tenantId: string): Promise<OrderEntity> {
    this.logger.log(`${this.updateOrder.name} Service Called`)
    const order = await this.findOneOrder(id, tenantId)

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
          const payment = await this.paymentRepository.createAndSave({
            orderId: order.id,
            transactionId,
            amount: order.totalAmount,
            currency: order.currency,
            method: order.paymentMethod || PaymentMethod.COD,
            status: PaymentStatus.COMPLETED,
            gatewayResponse: { note: 'Manual update from admin dashboard' },
            tenantId,
          })
        }
      }

      // Check for Order Cancellation to Restore Stock
      if (
        updateOrderDto.status === OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.COMPLETED // Don't restore if already completed? Usually, returns handle that.
      ) {
        for (const item of order.items) {
          await this.inventoryService.createInventoryTransaction(
            {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              type: InventoryTransactionType.IN,
              referenceType: InventoryTransactionReferenceType.ORDER,
              referenceId: order.id,
            },
            tenantId,
            queryRunner.manager,
          )
        }
      }

      // Check for Order Completion - removed old deduction logic here since it's now deducted at creation

      Object.assign(order, updateOrderDto)
      const savedOrder = await queryRunner.manager.save(order)

      // Sync Invoice Status
      if (updateOrderDto.paymentStatus === PaymentStatus.PAID) {
        await this.invoiceService.updateInvoiceStatusByOrderId(
          id,
          InvoiceStatus.PAID,
          tenantId,
        )
      } else if (updateOrderDto.status === OrderStatus.CANCELLED) {
        await this.invoiceService.updateInvoiceStatusByOrderId(
          id,
          InvoiceStatus.CANCELLED,
          tenantId,
        )
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


  async countByTenant(tenantId: string): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.orderRepository.countByTenant(tenantId)
  }

  async orderOverview(tenantId?: string): Promise<{ totalOrders: number; pendingOrders: number; completedOrders: number; cancelledOrders: number }> {
    this.logger.log(`${this.orderOverview.name} Service Called`)
    const cacheKey = 'orders:overview'
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.orderRepository.orderOverview(tenantId),
      300,
      tenantId
    )
  }
}
