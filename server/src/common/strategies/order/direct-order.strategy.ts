import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity';
import { OrderCreationContext, OrderCreationStrategy, OrderServiceDependencies } from './order-strategy.interface';
import { BaseOrderStrategy } from './base-order.strategy';

export class DirectOrderStrategy extends BaseOrderStrategy implements OrderCreationStrategy {
  async resolveItems(
    dto: CreateOrderDto,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<OrderItemEntity[]> {
    const processedItems: OrderItemEntity[] = [];
    if (dto.items && dto.items.length > 0) {
      for (const itemDto of dto.items) {
        const orderItem = await this.processItem(itemDto, context, deps);
        processedItems.push(orderItem);
      }
    }
    return processedItems;
  }

  async calculateTotals(
    order: OrderEntity,
    items: OrderItemEntity[],
    dto: CreateOrderDto,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<void> {
    const preCouponTotal = items.reduce((acc, item) => acc + item.totalAmount, 0);

    const { couponDiscountAmount, isFreeShipping } = await this.applyCoupon(
      order,
      preCouponTotal,
      dto.appliedCouponCode,
      context,
      deps,
    );

    const shippingFee = await this.calculateShipping(
      order,
      preCouponTotal - couponDiscountAmount,
      isFreeShipping,
      dto,
      context,
    );

    order.shippingFee = shippingFee;
    order.totalAmount = preCouponTotal - couponDiscountAmount + shippingFee;
    order.taxAmount = items.reduce((acc, item) => acc + Number(item.taxAmount) * item.quantity, 0);
  }
}
