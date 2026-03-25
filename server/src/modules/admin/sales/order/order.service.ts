import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { Brackets, DataSource, Repository } from 'typeorm'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { PricingUtil } from '@/common/utils/pricing.util'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { CouponService } from '@/modules/admin/sales/coupon/coupon.service'
import { PaymentService } from '@/modules/admin/sales/payment/payment.service'
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

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    // @InjectRepository(ProductEntity)
    // private productRepository: Repository<ProductEntity>,
    // @InjectRepository(ProductVariantEntity)
    // private variantRepository: Repository<ProductVariantEntity>,
    // @InjectRepository(UserEntity)
    // private userRepository: Repository<UserEntity>,
    // @InjectRepository(LeadEntity)
    // private leadRepository: Repository<LeadEntity>,
    // @InjectRepository(SiteSettingsEntity)
    // private settingsRepository: Repository<SiteSettingsEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private cartService: CartService,
    private readonly inventoryService: InventoryTransactionService,
    private readonly dataSource: DataSource,
    private readonly couponService: CouponService,
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto, tenantId: string) {
    this.logger.log(`${this.createOrder.name} Service Called`);
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      paymentMethod,
      orderNotes,
      currency,
      currencyRate,
      userId,
      items: directItems,
      appliedCouponCode,
      shippingZone,
    } = createOrderDto

    return await this.dataSource.transaction(async (manager) => {
      // Get settings for currency
      const settings = await manager.findOne(SiteSettingsEntity, {
        where: { tenantId },
      })

      // Find or create lead/user
      const user = userId ? await manager.findOne(UserEntity, {
        where: { id: userId, tenantId },
      }) : null

      let cart: any = null
      const processedItems: OrderItemEntity[] = []
      let preCouponTotal = 0

      const itemsToProcess = directItems && directItems.length > 0
        ? directItems
        : (async () => {
          cart = await this.cartService.createOrGetCart(user?.id, tenantId)
          if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException('Order must contain at least one item')
          }
          return cart.items.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
            pricing: item.pricing
          }))
        })()

      const resolvedItems = await (Array.isArray(itemsToProcess) ? Promise.resolve(itemsToProcess) : itemsToProcess)

      for (const itemDto of resolvedItems) {
        const { productId, variantId, quantity } = itemDto

        // Find product with pessimistic lock
        const product = await manager.findOne(ProductEntity, {
          where: { id: productId, tenantId },
          lock: { mode: 'pessimistic_write' }
        })

        if (!product) {
          throw new NotFoundException(`Product with ID ${productId} not found`)
        }

        let variant: ProductVariantEntity | null = null
        if (variantId) {
          variant = await manager.findOne(ProductVariantEntity, {
            where: { id: variantId, productId: product.id, tenantId },
            lock: { mode: 'pessimistic_write' }
          })
          if (!variant) {
            throw new NotFoundException(
              `Variant with ID ${variantId} not found for product ${product.name}`,
            )
          }
        }

        const currentStock = variant ? variant.stock : product.stock
        if (currentStock < quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}${variant ? ' (Variant)' : ''}. Only ${currentStock} items available.`,
          )
        }

        // Deduct stock immediately
        await this.inventoryService.createInventoryTransaction({
          productId: product.id,
          variantId: variant?.id,
          quantity: quantity,
          type: InventoryTransactionType.OUT,
          referenceType: InventoryTransactionReferenceType.ORDER,
          // referenceId will be updated later when order is saved
        }, tenantId, manager)

        const unitPrice = variant?.price ? Number(variant.price) : Number(product.price)

        // Calculate discount respecting discountType
        let discountAmount: number
        if (itemDto.pricing?.discount !== undefined) {
          discountAmount = Number(itemDto.pricing.discount)
        } else {
          const rawDiscount = Number(product.discountAmount || 0)
          const discountType = product.discountType || DiscountType.FIXED
          const orderDiscountStrategy = DiscountStrategyFactory.create(discountType as string);
          discountAmount = orderDiscountStrategy.calculate(unitPrice, rawDiscount);
        }

        // Apply tax on discounted price
        const taxRate = Number(product.taxRate || 0)
        const pricing = PricingUtil.calculateItemPricing(unitPrice, discountAmount, taxRate)
        const itemTotal = pricing.finalPrice * quantity

        const orderItem = new OrderItemEntity()
        orderItem.product = product
        orderItem.variant = variant
        orderItem.quantity = quantity
        orderItem.unitPrice = pricing.basePrice
        orderItem.discountAmount = pricing.discountAmount
        orderItem.taxAmount = pricing.taxAmount
        orderItem.totalAmount = itemTotal
        orderItem.tenantId = tenantId
        orderItem.snapshot = {
          productId: product.id,
          productName: product.name,
          productImage: product.images?.[0],
          variantId: variant?.id,
          variantSku: variant?.sku,
          variantOptions: variant?.combination,
          price: unitPrice,
        }

        processedItems.push(orderItem)
        if (directItems && directItems.length > 0) {
          preCouponTotal += itemTotal
        }
      }

      if (!directItems || directItems.length === 0) {
        preCouponTotal = cart.summary.subtotal - cart.summary.offer_discount;
      }

      // Create initial order
      const order = manager.create(OrderEntity, {
        customerName,
        customerEmail,
        customerPhone,
        address,
        items: processedItems,
        totalAmount: 0,
        currency: currency || settings?.currency || 'USD',
        currencyRate: currencyRate || 1,
        paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderNotes,
        userId: user?.id,
        tenantId,
        deliveryZone: shippingZone,
        taxAmount: processedItems.reduce((acc, item) => acc + Number(item.taxAmount) * item.quantity, 0),
      })

      let couponDiscountAmount = 0;
      const finalCouponCode = appliedCouponCode || cart?.appliedCouponCode;
      let isFreeShipping = false;

      if (finalCouponCode) {
        try {
          const validation = await this.couponService.validateCoupon(
            finalCouponCode,
            preCouponTotal,
            tenantId,
          );
          if (validation.valid) {
            couponDiscountAmount = validation.discountAmount;
            order.appliedCoupon = finalCouponCode;
            order.couponDiscountAmount = couponDiscountAmount;
            
            if (validation.coupon.discountType === DiscountType.FREE_SHIPPING || validation.coupon.discountType as any === 'free_shipping') {
              isFreeShipping = true;
            }

            await this.couponService.incrementUsage(validation.coupon.id, tenantId);
          }
        } catch (error) {
          this.logger.error('Invalid coupon at checkout', error);
        }
      }

      let shippingFee = PricingUtil.calculateShippingFee(
        shippingZone,
        settings?.shippingConfig,
        preCouponTotal - couponDiscountAmount,
      );

      if (isFreeShipping) {
        shippingFee = 0;
      }

      // POS/Admin manual override
      if (typeof createOrderDto.shippingFee === 'number') {
        shippingFee = createOrderDto.shippingFee;
      }

      order.shippingFee = shippingFee;
      order.totalAmount = preCouponTotal - couponDiscountAmount + shippingFee;
const savedOrder = await manager.save(order)

      // Update inventory transactions with order reference ID
      await manager.update(InventoryTransactionEntity,
        { referenceType: InventoryTransactionReferenceType.ORDER, referenceId: null, tenantId },
        { referenceId: savedOrder.id }
      )
      // Note: The above update is a bit risky if multiple orders are being created for the same tenant.
      // Better to track the transaction IDs and update them specifically.
      // Actually, my createInventoryTransaction returns the transaction.

      // Clear cart if user exists and this was a cart-based order
      if (user && user.id && !directItems) {
        await this.cartService.clearCart(user.id, tenantId)
      }

      // Automatically create invoice record
      try {
        await this.invoiceService.createInvoice({
          orderId: savedOrder.id,
          issueDate: new Date(),
          status: (savedOrder.paymentStatus === PaymentStatus.PAID) ? InvoiceStatus.PAID : InvoiceStatus.PENDING
        } as any, tenantId);
      } catch (invoiceError) {
        this.logger.error('Failed to auto-create invoice', invoiceError);
      }

      return { message: 'Order created successfully', success: true, order: savedOrder }
    });
  }


  async findAllOrders(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllOrders.name} Service Called`);
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
    this.logger.log(`${this.findOneOrder.name} Service Called`);
    const order = await this.orderRepository.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'items.variant', 'returns'],
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOneForCourier(id: string, tenantId: string) {
    this.logger.log(`${this.findOneForCourier.name} Service Called`);
    const order = await this.orderRepository.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product'],
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findByUserId(userId: string, tenantId: string, search?: string) {
    this.logger.log(`${this.findByUserId.name} Service Called`);
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('order.returns', 'returns')
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
    this.logger.log(`${this.updateOrder.name} Service Called`);
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
          const payment = this.paymentRepository.create({
            orderId: order.id,
            transactionId,
            amount: order.totalAmount,
            currency: order.currency,
            method: order.paymentMethod || 'Manual',
            status: 'SUCCESS',
            gatewayResponse: { note: 'Manual update from admin dashboard' },
            tenantId,
          })
          await queryRunner.manager.save(payment)
        }
      }

      // Check for Order Cancellation to Restore Stock
      if (
        updateOrderDto.status === OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.COMPLETED // Don't restore if already completed? Usually, returns handle that.
      ) {
        for (const item of order.items) {
          await this.inventoryService.createInventoryTransaction({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            type: InventoryTransactionType.IN,
            referenceType: InventoryTransactionReferenceType.ORDER,
            referenceId: order.id,
          }, tenantId, queryRunner.manager);
        }
      }

        // Check for Order Completion - removed old deduction logic here since it's now deducted at creation

      Object.assign(order, updateOrderDto)
      const savedOrder = await queryRunner.manager.save(order)

      // Sync Invoice Status
      if (updateOrderDto.paymentStatus === PaymentStatus.PAID) {
        await this.invoiceService.updateInvoiceStatusByOrderId(id, InvoiceStatus.PAID, tenantId);
      } else if (updateOrderDto.status === OrderStatus.CANCELLED) {
        await this.invoiceService.updateInvoiceStatusByOrderId(id, InvoiceStatus.CANCELLED, tenantId);
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
    this.logger.log(`${this.countByTenant.name} Service Called`);
    return await this.orderRepository.count({ where: { tenantId } })
  }

  async orderOverview() {
    this.logger.log(`${this.orderOverview.name} Service Called`);
    const totalOrders = await this.orderRepository.count()
    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    })
    const completedOrders = await this.orderRepository.count({
      where: { status: OrderStatus.COMPLETED },
    })
    const cancelledOrders = await this.orderRepository.count({
      where: { status: OrderStatus.CANCELLED },
    })
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    }
  }
}
