import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { OrderCreationStrategy } from './order-strategy.interface'
import { DirectOrderStrategy } from './direct-order.strategy'
import { CartOrderStrategy } from './cart-order.strategy'

export class OrderStrategyFactory {
  static create(dto: CreateOrderDto): OrderCreationStrategy {
    if (dto.items && dto.items.length > 0) {
      console.log("Direct Order Strategy");
      return new DirectOrderStrategy()
    }
    console.log("Cart Order Strategy");
    return new CartOrderStrategy()
  }
}
