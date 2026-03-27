import { EntityManager } from 'typeorm'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { CartService } from '@/modules/store/cart/cart.service'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { CouponService } from '@/modules/admin/sales/coupon/coupon.service'

export interface OrderCreationContext {
  tenantId: string
  manager: EntityManager
  user: UserEntity | null
  settings: SiteSettingsEntity | null
}

export interface OrderServiceDependencies {
  cartService: CartService
  inventoryService: InventoryTransactionService
  couponService: CouponService
}

export interface OrderCreationStrategy {
  resolveItems(
    dto: CreateOrderDto,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<OrderItemEntity[]>
  calculateTotals(
    order: OrderEntity,
    items: OrderItemEntity[],
    dto: CreateOrderDto,
    context: OrderCreationContext,
    deps: OrderServiceDependencies,
  ): Promise<void>
}
