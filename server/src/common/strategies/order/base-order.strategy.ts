import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity';
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity';
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity';
import { DiscountType } from '@/common/enums/discount-type.enum';
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory';
import { ItemPricingStrategyFactory } from '@/common/strategies/pricing/item-pricing-strategy.factory';
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum';
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum';
import { OrderCreationContext, OrderServiceDependencies } from './order-strategy.interface';
import { ShippingStrategyFactory } from '@/common/strategies/shipping/shipping-strategy.factory';

export abstract class BaseOrderStrategy {
  protected async processItem(
    itemDto: any,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<OrderItemEntity> {
    const { productId, variantId, quantity, pricing: itemPricingDto } = itemDto;
    const { manager, tenantId } = context;

    const product = await manager.findOne(ProductEntity, {
      where: { id: productId, tenantId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    let variant: ProductVariantEntity | null = null;
    if (variantId) {
      variant = await manager.findOne(ProductVariantEntity, {
        where: { id: variantId, productId: product.id, tenantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found for product ${product.name}`);
      }
    }

    const currentStock = variant ? variant.stock : product.stock;
    if (currentStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${product.name}${variant ? ' (Variant)' : ''}. Only ${currentStock} items available.`,
      );
    }

    // Deduct stock immediately
    await deps.inventoryService.createInventoryTransaction(
      {
        productId: product.id,
        variantId: variant?.id,
        quantity: quantity,
        type: InventoryTransactionType.OUT,
        referenceType: InventoryTransactionReferenceType.ORDER,
      },
      tenantId,
      manager,
    );

    const unitPrice = variant?.price ? Number(variant.price) : Number(product.price);

    let discountAmount: number;
    if (itemPricingDto?.discount !== undefined) {
      discountAmount = Number(itemPricingDto.discount);
    } else {
      const rawDiscount = Number(product.discountAmount || 0);
      const discountType = product.discountType || DiscountType.FIXED;
      const orderDiscountStrategy = DiscountStrategyFactory.create(discountType as string);
      discountAmount = orderDiscountStrategy.calculate(unitPrice, rawDiscount);
    }

    const taxRate = Number(product.taxRate || 0);
    const pricingStrategy = ItemPricingStrategyFactory.create('standard');
    const pricing = pricingStrategy.calculate(unitPrice, discountAmount, taxRate);
    const itemTotal = pricing.finalPrice * quantity;

    const orderItem = new OrderItemEntity();
    orderItem.product = product;
    orderItem.variant = variant;
    orderItem.quantity = quantity;
    orderItem.unitPrice = pricing.basePrice;
    orderItem.discountAmount = pricing.discountAmount;
    orderItem.taxAmount = pricing.taxAmount;
    orderItem.totalAmount = itemTotal;
    orderItem.tenantId = tenantId;
    orderItem.snapshot = {
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0],
      variantId: variant?.id,
      variantSku: variant?.sku,
      variantOptions: variant?.combination,
      price: unitPrice,
    };

    return orderItem;
  }

  protected async applyCoupon(
    order: OrderEntity,
    preCouponTotal: number,
    couponCode: string,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<{ couponDiscountAmount: number; isFreeShipping: boolean }> {
    let couponDiscountAmount = 0;
    let isFreeShipping = false;

    if (couponCode) {
      try {
        const validation = await deps.couponService.validateCoupon(couponCode, preCouponTotal, context.tenantId);
        if (validation.valid) {
          couponDiscountAmount = validation.discountAmount;
          order.appliedCoupon = couponCode;
          order.couponDiscountAmount = couponDiscountAmount;

          if (
            validation.coupon.discountType === DiscountType.FREE_SHIPPING ||
            (validation.coupon.discountType as any) === 'free_shipping'
          ) {
            isFreeShipping = true;
          }

          await deps.couponService.incrementUsage(validation.coupon.id, context.tenantId);
        }
      } catch (error) {
        // Log error but continue
      }
    }

    return { couponDiscountAmount, isFreeShipping };
  }

  protected async calculateShipping(
    order: OrderEntity,
    totalAfterCoupon: number,
    isFreeShipping: boolean,
    dto: CreateOrderDto,
    context: OrderCreationContext,
  ): Promise<number> {
    const strategy = ShippingStrategyFactory.create(dto.shippingZone);
    let shippingFee = strategy.calculate(context.settings?.shippingConfig, totalAfterCoupon);

    if (isFreeShipping) {
      shippingFee = 0;
    }

    if (typeof dto.shippingFee === 'number') {
      shippingFee = dto.shippingFee;
    }

    return shippingFee;
  }
}
