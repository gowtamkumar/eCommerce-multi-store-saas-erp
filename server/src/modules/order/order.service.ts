import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { OrderStatus } from 'src/common/enums/order-status.enum'
import { PaymentStatus } from 'src/common/enums/payment-status.enum'
import { Brackets, DataSource, Repository } from 'typeorm'
import { InventoryTransactionReferenceType } from '../../common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '../../common/enums/inventory-transaction-type.enum'
import { UserEntity } from '../admin/user/entities/user.entity'
import { CartService } from '../cart/cart.service'
import { CouponService } from '../coupon/coupon.service'
import { LeadEntity } from '../lead/entities/lead.entity'
import { InventoryTransactionService } from '../others/inventory-transaction/inventory-transaction.service'
import { PaymentEntity } from '../payment/entities/payment.entity'
import { ProductEntity } from '../product/entities/product.entity'
import { ProductVariantEntity } from '../product/entities/variant.entity'
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { OrderItemEntity } from './entities/order-item.entity'
import { OrderEntity } from './entities/order.entity'

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private variantRepository: Repository<ProductVariantEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(LeadEntity)
    private leadRepository: Repository<LeadEntity>,
    @InjectRepository(SiteSettingsEntity)
    private settingsRepository: Repository<SiteSettingsEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private cartService: CartService,
    private readonly inventoryService: InventoryTransactionService,
    private readonly dataSource: DataSource,
    private readonly couponService: CouponService,
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
    } = createOrderDto

    // Get settings for currency
    const settings = await this.settingsRepository.findOne({
      where: { tenantId },
    })

    // Find or create lead/user
    const user = userId ? await this.userRepository.findOne({
      where: { id: userId, tenantId },
    }) : null

    let cart: any = null
    const processedItems: OrderItemEntity[] = []
    let preCouponTotal = 0

    if (directItems && directItems.length > 0) {
      // Process direct items (Admin/Inner Order flow)
      for (const itemDto of directItems) {
        const { productId, variantId, quantity } = itemDto

        // find product
        const product = await this.productRepository.findOne({
          where: { id: productId, tenantId },
        })

        if (!product) {
          throw new NotFoundException(`Product with ID ${productId} not found`)
        }

        let variant: ProductVariantEntity | null = null
        if (variantId) {
          variant = await this.variantRepository.findOne({
            where: { id: variantId, productId: product.id, tenantId },
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

        const unitPrice = variant?.price ? Number(variant.price) : Number(product.price)
        const discountAmount = Number(product.discountAmount) || 0
        const itemTotal = (unitPrice - discountAmount) * quantity

        const orderItem = new OrderItemEntity()
        orderItem.product = product
        orderItem.variant = variant
        orderItem.quantity = quantity
        orderItem.unitPrice = unitPrice
        orderItem.discountAmount = discountAmount
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
        preCouponTotal += itemTotal
      }
    } else {
      // Always fetch from backend cart to ensure single source of truth (Customer flow)
      cart = await this.cartService.createOrGetCart(user?.id, tenantId)

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Order must contain at least one item')
      }

      // Process each item from cart
      for (const itemDto of cart.items) {
        const productId = itemDto.product.id
        const variantId = itemDto.variant?.id
        const quantity = itemDto.quantity

        // find product
        const product = await this.productRepository.findOne({
          where: { id: productId, tenantId },
        })

        if (!product) {
          throw new NotFoundException(`Product with ID ${productId} not found`)
        }

        let variant: ProductVariantEntity | null = null
        if (variantId) {
          variant = await this.variantRepository.findOne({
            where: { id: variantId, productId: product.id, tenantId },
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

        const unitPrice = variant?.price ? Number(variant.price) : Number(product.price)
        const discountAmount = itemDto.pricing?.discount ? Number(itemDto.pricing.discount) : (Number(product.discountAmount) || 0)
        const itemTotal = (unitPrice - discountAmount) * quantity

        const orderItem = new OrderItemEntity()
        orderItem.product = product
        orderItem.variant = variant
        orderItem.quantity = quantity
        orderItem.unitPrice = unitPrice
        orderItem.discountAmount = discountAmount
        orderItem.totalAmount = itemTotal
        orderItem.tenantId = tenantId

        // TAKING SNAPSHOT HERE
        orderItem.snapshot = {
          productId: product.id,
          productName: product.name,
          productImage: product.images?.[0],
          variantId: variant?.id,
          variantSku: variant?.sku,
          variantOptions: variant?.combination, // e.g. { Color: "Red" }
          price: unitPrice,
        }

        processedItems.push(orderItem)
      }
      preCouponTotal = cart.summary.subtotal - cart.summary.offer_discount;
    }

    // Create initial order
    const order = this.orderRepository.create({
      customerName,
      customerEmail,
      customerPhone,
      address,
      items: processedItems,
      totalAmount: 0, // Will be calculated
      currency: currency || settings?.currency || 'USD',
      currencyRate: currencyRate || 1,
      paymentMethod,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      orderNotes,
      userId: user?.id,
      tenantId,
    })

    let couponDiscountAmount = 0
    const finalCouponCode = appliedCouponCode || cart?.appliedCouponCode

    if (finalCouponCode) {
      try {
        const validation = await this.couponService.validateCoupon(
          finalCouponCode,
          preCouponTotal,
          tenantId
        );
        if (validation.valid) {
          couponDiscountAmount = validation.discountAmount;
          order.appliedCoupon = finalCouponCode;
          order.couponDiscountAmount = couponDiscountAmount;

          // Track usage
          await this.couponService.incrementUsage(validation.coupon.id, tenantId);
        }
      } catch (error) {
        // Log or ignore invalid coupons at checkout, we just won't apply the discount
        console.error('Invalid coupon at checkout', error);
      }
    }

    // Calculate final total
    order.totalAmount = preCouponTotal - couponDiscountAmount

    const savedOrder = await this.orderRepository.save(order)

    // Clear cart if user exists and this was a cart-based order
    if (user && user.id && !directItems) {
      await this.cartService.clearCart(user.id, tenantId)
    }

    return { message: 'Order created successfully', success: true, order: savedOrder }
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

      // Check for Order Completion to log Inventory Transaction
      if (
        updateOrderDto.status === OrderStatus.COMPLETED &&
        oldStatus !== OrderStatus.COMPLETED
      ) {
        for (const item of order.items) {
          await this.inventoryService.createInventoryTransaction({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            type: InventoryTransactionType.OUT,
            referenceType: InventoryTransactionReferenceType.ORDER,
            referenceId: order.id,
          }, tenantId);
        }
      }

      Object.assign(order, updateOrderDto)
      const savedOrder = await queryRunner.manager.save(order)

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
