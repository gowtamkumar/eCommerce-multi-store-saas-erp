import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { OrderCheckoutService } from './order-checkout.service'
import { CartService } from '@/modules/store/cart/cart.service'
import { ShippingAddressService } from '@/modules/store/shipping-address/shipping-address.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ArService } from '@/modules/admin/operations/finance/accounting/services/ar.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { OrderProcessHelper } from './order-process.helper'

describe('OrderCheckoutService', () => {
  let service: OrderCheckoutService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCheckoutService,
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: CartService, useValue: {} },
        { provide: ShippingAddressService, useValue: {} },
        { provide: CacheService, useValue: {} },
        { provide: ArService, useValue: {} },
        { provide: WalletService, useValue: {} },
        { provide: OrderProcessHelper, useValue: {} },
        { provide: getQueueToken('accounting'), useValue: { add: jest.fn() } },
        { provide: getQueueToken('invoice'), useValue: { add: jest.fn() } },
        { provide: getQueueToken('order'), useValue: { add: jest.fn() } },
      ],
    }).compile()

    service = module.get<OrderCheckoutService>(OrderCheckoutService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
