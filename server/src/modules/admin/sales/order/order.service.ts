import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { Brackets, DataSource } from 'typeorm'
import { OrderRepository } from './order.repository'
import { PaymentRepository } from '../payment/payment.repository'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { CouponService } from '@/modules/admin/sales/coupon/coupon.service'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { InventoryTransactionEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-transaction.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { PaymentEntity } from '../payment/entities/payment.entity'
import { CartService } from '@/modules/store/cart/cart.service'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { ShippingStrategyFactory } from '@/common/strategies/shipping/shipping-strategy.factory'
import { ItemPricingStrategyFactory } from '@/common/strategies/pricing/item-pricing-strategy.factory'
import { ShippingAddressService } from '@/modules/store/shipping-address/shipping-address.service'
import { OrderStrategyFactory } from '@/common/strategies/order/order-strategy.factory'
import {
  OrderCreationContext,
  OrderServiceDependencies,
} from '@/common/strategies/order/order-strategy.interface'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { PaymentMethod } from '@/common/enums/payment-method.enum'

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private settingsRepository: SiteSettingsRepository,
    private cartService: CartService,
    private readonly inventoryService: InventoryTransactionService,
    private readonly dataSource: DataSource,
    private readonly couponService: CouponService,
    private readonly invoiceService: InvoiceService,
    private readonly shippingAddressService: ShippingAddressService,
    private readonly mailService: MailService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, tenantId: string) {
    this.logger.log(`${this.createOrder.name} Service Called`)

    return await this.dataSource.transaction(async (manager) => {
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
          // Fallback to provided address is already handled by default initialization
        }
      }

      // 3. Initialize Context & Strategy
      const context: OrderCreationContext = { tenantId, manager, user, settings }
      const deps: OrderServiceDependencies = {
        cartService: this.cartService,
        inventoryService: this.inventoryService,
        couponService: this.couponService,
      }

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

      try {
        await this.invoiceService.createInvoice(
          {
            orderId: savedOrder.id,
            issueDate: new Date(),
            status:
              savedOrder.paymentStatus === PaymentStatus.PAID
                ? InvoiceStatus.PAID
                : InvoiceStatus.PENDING,
          } as any,
          tenantId,
          manager,
        )
      } catch (invoiceError) {
        this.logger.error('Failed to auto-create invoice', invoiceError)
      }

      // 10. Admin Notification (for manual payments)
      if (savedOrder.paymentMethod === PaymentMethod.COD) {
        const orderWithRelations = await manager.findOne(OrderEntity, {
          where: { id: savedOrder.id, tenantId },
          relations: ['items', 'items.product', 'items.variant'],
        })
        if (orderWithRelations) {
          this.mailService.sendNewOrderNotification(orderWithRelations, tenantId)
        }
      }

      return { message: 'Order created successfully', success: true, order: savedOrder }
    })
  }

  async findAllOrders(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllOrders.name} Service Called`)
    const { page, limit, search, status } = filterDto

    const skip = (page - 1) * limit

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .where('order.tenantId = :tenantId', { tenantId })

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status })
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.customerName ILIKE :search OR order.customerEmail ILIKE :search OR order.customerPhone ILIKE :search OR CAST(order.id AS TEXT) ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    const [orders, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      orders,
      total,
    }
  }

  async findOneOrder(id: string, tenantId: string) {
    this.logger.log(`${this.findOneOrder.name} Service Called`)
    const order = await this.orderRepository.findOrderById(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOneForCourier(id: string, tenantId: string) {
    this.logger.log(`${this.findOneForCourier.name} Service Called`)
    const order = await this.orderRepository.findOneForCourier(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findByUserId(userId: string, tenantId: string, search?: string) {
    this.logger.log(`${this.findByUserId.name} Service Called`)
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('order.returns', 'returns')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .where('order.userId = :userId', { userId })
      .andWhere('order.tenantId = :tenantId', { tenantId })

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('order.customerName ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customerEmail ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customerPhone ILIKE :search', { search: `%${search}%` })
            .orWhere('CAST(order.id AS TEXT) ILIKE :search', { search: `%${search}%` })
            .orWhere('product.name ILIKE :search', { search: `%${search}%` })
        }),
      )
    }

    return await queryBuilder.orderBy('order.createdAt', 'DESC').getMany()
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto, tenantId: string) {
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
          queryRunner.manager,
        )
      } else if (updateOrderDto.status === OrderStatus.CANCELLED) {
        await this.invoiceService.updateInvoiceStatusByOrderId(
          id,
          InvoiceStatus.CANCELLED,
          tenantId,
          queryRunner.manager,
        )
      }

      await queryRunner.commitTransaction()
      return savedOrder
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  // async findAllOrders(filterDto: any, tenantId: string) {
  //     this.logger.log(`${this.findAllOrders.name} Service Called`);
  //   return await this.orderRepository.find({
  //     order: { createdAt: 'DESC' },
  //   })
  // }

  async countByTenant(tenantId: string) {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.orderRepository.countByTenant(tenantId)
  }

  async orderOverview(tenantId?: string) {
    this.logger.log(`${this.orderOverview.name} Service Called`)
    const where = tenantId ? { tenantId } : {}
    const totalOrders = await this.orderRepository.count({ where })
    const pendingOrders = await this.orderRepository.count({
      where: { ...where, status: OrderStatus.PENDING },
    })
    const completedOrders = await this.orderRepository.count({
      where: { ...where, status: OrderStatus.COMPLETED },
    })
    const cancelledOrders = await this.orderRepository.count({
      where: { ...where, status: OrderStatus.CANCELLED },
    })
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    }
  }
}
