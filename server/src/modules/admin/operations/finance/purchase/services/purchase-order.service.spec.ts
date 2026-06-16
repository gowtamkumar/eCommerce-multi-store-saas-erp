import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { GrnRepository } from '@/modules/admin/operations/logistics/grn/grn.repository'
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository'
import { SupplierPaymentRepository } from '../repositories/supplier-payment.repository'
import { PurchaseOrderService } from './purchase-order.service'

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        {
          provide: PurchaseOrderRepository,
          useValue: {},
        },
        {
          provide: SupplierPaymentRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: getQueueToken('product'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: GrnRepository,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PurchaseOrderService>(PurchaseOrderService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
