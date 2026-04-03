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
import { CouponService } from '@/modules/admin/sales/coupon/coupon.service'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
import { CartService } from '@/modules/store/cart/cart.service'
import { ShippingAddressService } from '@/modules/store/shipping-address/shipping-address.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Brackets, DataSource } from 'typeorm'
import { PaymentEntity } from '../payment/entities/payment.entity'
import { PaymentRepository } from '../payment/payment.repository'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { OrderRepository } from './order.repository'


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
    private readonly mailService: MailService,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto, tenantId: string): Promise<{ message: string; success: boolean; order: OrderEntity }> {
    this.logger.log(`${this.createOrder.name} Service Called`)

    return await this.dataSource.transaction(async (manager) => {
      console.log("transaction start");
      // 1. Initial Data Fetching
      const settings = await manager.findOne(SiteSettingsEntity, { where: { tenantId } })

      console.log("settings", settings);

      const user = createOrderDto.userId
        ? await manager.findOne(UserEntity, { where: { id: createOrderDto.userId, tenantId } })
        : null

      console.log("Address Resolution up");
      // 2. Address Resolution
      let resolvedAddress = createOrderDto.address
      if (createOrderDto.shippingAddressId && createOrderDto.userId) {
        try {
          console.log("Address Resolution inside");
          const savedAddress = await this.shippingAddressService.findShippingAddress(
            createOrderDto.shippingAddressId,
            createOrderDto.userId,
            tenantId,
          )
          console.log("Address Resolution inside donw");
          resolvedAddress = `${savedAddress.recipientName}, ${savedAddress.address}${savedAddress.city ? ', ' + savedAddress.city : ''}`
        } catch (err) {
          // Fallback to provided address is already handled by default initialization
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
      console.log(" Resolve Items up");
      // 4. Resolve Items
      const processedItems = await strategy.resolveItems(createOrderDto, context, deps)
      console.log(" Resolve Items down");
      console.log(" Initialize Order Entity up");
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

      const finalOrder = await manager.findOne(OrderEntity, {
        where: { id: savedOrder.id, tenantId },
        relations: ['items', 'items.product', 'items.variant'],
      })

      // Fetch invoice count and number if needed
      const invoice = await manager.getRepository(InvoiceEntity).findOne({
        where: { orderId: savedOrder.id, tenantId }
      })

      if (finalOrder && invoice) {
        ; (finalOrder as any).invoiceNumber = invoice.invoiceNumber
      }

      return { message: 'Order created successfully', success: true, order: finalOrder || savedOrder }

    })
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

  async findByUserId(userId: string, tenantId: string, search?: string): Promise<OrderEntity[]> {
    this.logger.log(`${this.findByUserId.name} Service Called`)
    return await this.orderRepository.findByUserId(userId, tenantId, search)
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

  async countByTenant(tenantId: string): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.orderRepository.countByTenant(tenantId)
  }

  async orderOverview(tenantId?: string): Promise<{ totalOrders: number; pendingOrders: number; completedOrders: number; cancelledOrders: number }> {
    this.logger.log(`${this.orderOverview.name} Service Called`)
    return await this.orderRepository.orderOverview(tenantId)
  }
}
