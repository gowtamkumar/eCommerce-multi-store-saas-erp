import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { PaymentRepository } from '../../payment/repositories/payment.repository'
import { OrderRepository } from '../repositories/order.repository'
import { LoyaltyService } from '@/modules/admin/marketing/loyalty/services/loyalty.service'
import { ReferralService } from '@/modules/admin/marketing/loyalty/services/referral.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { OrderLifecycleService } from './order-lifecycle.service'

describe('OrderLifecycleService', () => {
  let service: OrderLifecycleService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderLifecycleService,
        {
          provide: OrderRepository,
          useValue: {},
        },
        {
          provide: PaymentRepository,
          useValue: {},
        },
        {
          provide: InventoryLedgerService,
          useValue: {},
        },
        {
          provide: StockReservationService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getQueueToken('invoice'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getQueueToken('fulfillment'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: LoyaltyService,
          useValue: {},
        },
        {
          provide: ReferralService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<OrderLifecycleService>(OrderLifecycleService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
