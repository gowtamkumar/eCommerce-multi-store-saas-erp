import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderRepository } from '../repositories/order.repository'
import { OrderCheckoutService } from './order-checkout.service'
import { OrderLifecycleService } from './order-lifecycle.service'
import { OrderService } from './order.service'

describe('OrderService', () => {
  let service: OrderService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: OrderCheckoutService,
          useValue: {},
        },
        {
          provide: OrderLifecycleService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<OrderService>(OrderService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
