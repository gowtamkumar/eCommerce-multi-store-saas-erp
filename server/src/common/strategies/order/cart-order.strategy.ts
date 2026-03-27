import { BadRequestException } from '@nestjs/common'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import {
  OrderCreationContext,
  OrderCreationStrategy,
  OrderServiceDependencies,
} from './order-strategy.interface'
import { BaseOrderStrategy } from './base-order.strategy'

export class CartOrderStrategy extends BaseOrderStrategy implements OrderCreationStrategy {
  async resolveItems(
    dto: CreateOrderDto,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<OrderItemEntity[]> {
    const cart = await deps.cartService.createOrGetCart(context.user?.id, context.tenantId)

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item')
    }

    const processedItems: OrderItemEntity[] = []
    for (const item of cart.items) {
      const itemDto = {
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
        pricing: item.pricing,
      }
      const orderItem = await this.processItem(itemDto, context, deps)
      processedItems.push(orderItem)
    }

    // Attach cart to context for total calculation if needed
    ;(context as any).cart = cart

    return processedItems
  }

  async calculateTotals(
    order: OrderEntity,
    items: OrderItemEntity[],
    dto: CreateOrderDto,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<void> {
    const cart = (context as any).cart
    const preCouponTotal = cart.summary.subtotal - cart.summary.offer_discount

    const finalCouponCode = dto.appliedCouponCode || cart.appliedCouponCode

    const { couponDiscountAmount, isFreeShipping } = await this.applyCoupon(
      order,
      preCouponTotal,
      finalCouponCode,
      context,
      deps,
    )

    const shippingFee = await this.calculateShipping(
      order,
      preCouponTotal - couponDiscountAmount,
      isFreeShipping,
      dto,
      context,
    )

    order.shippingFee = shippingFee
    order.totalAmount = preCouponTotal - couponDiscountAmount + shippingFee
    order.taxAmount = items.reduce((acc, item) => acc + Number(item.taxAmount) * item.quantity, 0)
  }
}
