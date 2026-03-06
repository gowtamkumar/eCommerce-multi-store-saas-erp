import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { OrderStatus } from 'src/common/enums/order-status.enum'
import { PaymentStatus } from 'src/common/enums/payment-status.enum'
import { Brackets, Repository } from 'typeorm'
import { UserEntity } from '../admin/user/entities/user.entity'
import { CartService } from '../cart/cart.service'
import { LeadEntity } from '../lead/entities/lead.entity'
import { PaymentEntity } from '../payment/entities/payment.entity'
import { ProductEntity } from '../product/entities/product.entity'
import { ProductVariantEntity } from '../product/entities/variant.entity'
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { OrderItemEntity } from './entities/order-item.entity'
import { OrderEntity } from './entities/order.entity'
import { CouponService } from '../coupon/coupon.service'
import { InventoryTransactionService } from '../others/inventory-transaction/inventory-transaction.service'
import { InventoryTransactionType } from '../../common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '../../common/enums/inventory-transaction-reference-type.enum'
import { DataSource } from 'typeorm'

@Injectable()
export class OrderService {
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

  async create(createOrderDto: CreateOrderDto, tenantId: string) {
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
    } = createOrderDto

    // Get settings for currency
    const settings = await this.settingsRepository.findOne({
      where: { tenantId },
    })

    // Find or create lead/user
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    })

    // Always fetch from backend cart to ensure single source of truth
    const cart = await this.cartService.createOrGetCart(user?.id, tenantId)

    if (!cart.items && cart.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item')
    }

    // Create initial order
    const order = this.orderRepository.create({
      customerName,
      customerEmail,
      customerPhone,
      address,
      items: [],
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

    let totalOrderAmount = 0
    const processedItems: OrderItemEntity[] = []

    // Process each item
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

    // Use cart's computed pre-coupon total
    const preCouponTotal = cart.summary.subtotal - cart.summary.offer_discount;

    let couponDiscountAmount = 0
    if (cart.appliedCouponCode) {
      try {
        const validation = await this.couponService.validateCoupon(
          cart.appliedCouponCode,
          preCouponTotal,
          tenantId
        );
        if (validation.valid) {
          couponDiscountAmount = validation.discountAmount;
          order.appliedCoupon = cart.appliedCouponCode;
          order.couponDiscountAmount = couponDiscountAmount;

          // Track usage
          await this.couponService.incrementUsage(validation.coupon.id, tenantId);
        }
      } catch (error) {
        // Log or ignore invalid coupons at checkout, we just won't apply the discount
        console.error('Invalid coupon at checkout', error);
      }
    }

    // Calculate final total based on Cart's computed pre-coupon total minus applied valid coupon
    order.totalAmount = preCouponTotal - couponDiscountAmount
    order.items = processedItems

    const savedOrder = await this.orderRepository.save(order)

    // Clear cart if user exists
    if (user && user.id) {
      await this.cartService.clearCart(user.id, tenantId)
    }

    return { message: 'Order created successfully', success: true, order: savedOrder }
  }

  async findAll(filterDto: any, tenantId: string) {
    const { page, limit, search, status } = filterDto
    console.log('filterDto', filterDto)

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

  async findOne(id: string, tenantId: string) {
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

  async update(id: string, updateOrderDto: UpdateOrderDto, tenantId: string) {
    const order = await this.findOne(id, tenantId)

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
          await this.inventoryService.create({
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

  async findAllOrders() {
    return await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async countByTenant(tenantId: string) {
    return await this.orderRepository.count({ where: { tenantId } })
  }

  async orderOverview() {
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
