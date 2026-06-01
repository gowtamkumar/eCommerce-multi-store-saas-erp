import { RequestContextDto } from '@/common/dto/request-context.dto'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { ItemPricingStrategyFactory } from '@/common/strategies/pricing/item-pricing-strategy.factory'
import { ShippingStrategyFactory } from '@/common/strategies/shipping/shipping-strategy.factory'
import { PricingService } from '@/modules/admin/catalog/pricing/pricing.service'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { CouponService } from '@/modules/admin/sales/coupon/services/coupon.service'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'

@Injectable()
export class OrderProcessHelper {
  private readonly logger = new Logger(OrderProcessHelper.name)

  constructor(
    private readonly inventoryService: InventoryLedgerService,
    private readonly reservationService: StockReservationService,
    private readonly couponService: CouponService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Processes a single item: validates product/variant, checks stock, and deducts inventory.
   * Returns the built OrderItemEntity, the inventory ledger entry ID, and the
   * stock reservation ID (null for SERVICE products that skip inventory).
   * The caller must link the ledger entry to the final order ID after the order is saved.
   */
  async processItem(
    itemDto: any,
    ctx: RequestContextDto,
    manager: EntityManager,
    priceBookCode?: string | null,
  ): Promise<{
    orderItem: OrderItemEntity
    ledgerEntryId: string | null
    reservationId: string | null
  }> {
    const { productId, variantId, quantity, pricing: itemPricingDto } = itemDto
    const tenantId = ctx.tenantId

    const product = await manager.findOne(ProductEntity, {
      where: { id: productId, tenantId },
      lock: { mode: 'pessimistic_write' },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    let variant: ProductVariantEntity | null = null
    if (variantId) {
      variant = await manager.findOne(ProductVariantEntity, {
        where: { id: variantId, productId: product.id, tenantId },
        lock: { mode: 'pessimistic_write' },
      })
      if (!variant) {
        throw new NotFoundException(
          `Variant with ID ${variantId} not found for product ${product.name}`,
        )
      }
    }

    const isService = product.productType === 'SERVICE'

    // ── Pricing ────────────────────────────────────────────────────────────
    const tierPrice = await this.pricingService.getApplicablePrice(
      product.id,
      variant?.id || null,
      quantity,
      priceBookCode || null, // Use specified book; falls back to default if null
      tenantId,
    )

    const unitPrice =
      tierPrice !== null
        ? tierPrice
        : variant?.price
          ? Number(variant.price)
          : Number(product.price)

    let discountAmount: number
    if (itemPricingDto?.discount !== undefined) {
      discountAmount = Number(itemPricingDto.discount)
    } else {
      const rawDiscount = Number(product.discountAmount || 0)
      const discountType = product.discountType || DiscountType.FIXED
      const orderDiscountStrategy = DiscountStrategyFactory.create(discountType as string)
      discountAmount = orderDiscountStrategy.calculate(unitPrice, rawDiscount)
    }

    const taxRate = Number(product.taxRate || 0)
    const pricingStrategy = ItemPricingStrategyFactory.create('standard')
    const pricing = pricingStrategy.calculate(unitPrice, discountAmount, taxRate)
    const itemTotal = pricing.finalPrice * quantity

    // ── Build order item ───────────────────────────────────────────────────
    const buildOrderItem = (): OrderItemEntity => {
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
      return orderItem
    }

    // ── Inventory ──────────────────────────────────────────────────────────────
    if (isService) {
      // Service products have no stock; skip inventory entirely.
      return { orderItem: buildOrderItem(), ledgerEntryId: null, reservationId: null }
    }

    const currentStock = await this.inventoryService.getGlobalLiveStock(
      product.id,
      variant?.id || null,
      tenantId,
      manager,
    )
    if (currentStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${product.name}${variant ? ' (Variant)' : ''}. Only ${currentStock} items available.`,
      )
    }

    // 1. Immutable ledger entry (RESERVATION type) — keeps the audit stream intact.
    //    referenceId left null here; backfilled by order.service after the order is saved.
    const ledgerEntry = await this.inventoryService.createLedgerEntry(
      {
        productId: product.id,
        variantId: variant?.id,
        quantity: quantity,
        type: InventoryTransactionType.RESERVATION,
        referenceType: InventoryTransactionReferenceType.ORDER,
        // referenceId intentionally omitted — backfilled by order.service after save
      },
      ctx,
      manager,
    )

    // 2. Lifecycle reservation row — enables ATP queries, expiry, release, and fulfill.
    //    orderId is also left null here and backfilled by order.service after the order is saved.
    const reservation = await this.reservationService.reserve(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        warehouseId: null, // warehouseId not yet known at order creation; set during fulfillment
        orderId: null, // backfilled after order.save() — same pattern as ledgerEntry
        reservedQty: quantity,
      },
      ctx,
      manager,
    )

    return {
      orderItem: buildOrderItem(),
      ledgerEntryId: ledgerEntry.id,
      reservationId: reservation.id,
    }
  }

  /**
   * Validates and applies a coupon to the order.
   *
   * Reservation must run inside the order's transaction so the counter
   * rolls back automatically if the order itself fails. The conditional
   * UPDATE in `reserveUsage` closes the validate-then-increment race that
   * previously let coupons go over `usage_limit` under concurrent checkout.
   */
  async applyCoupon(
    order: OrderEntity,
    preCouponTotal: number,
    couponCode: string | undefined,
    ctx: RequestContextDto,
    manager: EntityManager,
  ): Promise<{ couponDiscountAmount: number; isFreeShipping: boolean }> {
    let couponDiscountAmount = 0
    let isFreeShipping = false

    if (!couponCode) return { couponDiscountAmount, isFreeShipping }

    try {
      const validation = await this.couponService.validateCoupon(couponCode, preCouponTotal, ctx)
      if (!validation.valid) return { couponDiscountAmount, isFreeShipping }

      // Atomically claim a usage slot. Throws if the slot is gone.
      await this.couponService.reserveUsage(validation.coupon.id, ctx, manager)

      couponDiscountAmount = validation.discountAmount
      order.appliedCoupon = couponCode
      order.couponDiscountAmount = couponDiscountAmount
      if (validation.coupon.discountType === DiscountType.FREE_SHIPPING) {
        isFreeShipping = true
      }
    } catch (error) {
      // Concurrent over-redeem or stale validate — surface to the caller so
      // checkout fails cleanly instead of silently dropping the discount.
      if (error instanceof BadRequestException) throw error
      this.logger.warn(`Coupon validation failed for code: ${couponCode}`, error?.message)
    }

    return { couponDiscountAmount, isFreeShipping }
  }

  /**
   * Calculates shipping fees based on the zone and free shipping eligibility.
   */
  async calculateShipping(
    totalAfterCoupon: number,
    isFreeShipping: boolean,
    dto: CreateOrderDto,
    settings: SiteSettingsEntity | null,
    ctx: RequestContextDto,
  ): Promise<number> {
    const tenantId = ctx.tenantId
    const shippingZone = (dto.shippingZone as any) || 'standard'
    const strategy = ShippingStrategyFactory.create(shippingZone)
    let shippingFee = strategy.calculate(settings?.shippingConfig, totalAfterCoupon)

    if (isFreeShipping) {
      shippingFee = 0
    }

    if (typeof dto.shippingFee === 'number') {
      shippingFee = dto.shippingFee
    }

    return shippingFee
  }
}
