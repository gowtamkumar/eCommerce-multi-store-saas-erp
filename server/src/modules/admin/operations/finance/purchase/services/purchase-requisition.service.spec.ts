import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { PurchaseRequisitionRepository } from '../repositories/purchase-requisition.repository'
import { PurchaseOrderService } from './purchase-order.service'
import { PurchaseRequisitionService } from './purchase-requisition.service'

describe('PurchaseRequisitionService', () => {
  let service: PurchaseRequisitionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequisitionService,
        {
          provide: PurchaseRequisitionRepository,
          useValue: {},
        },
        {
          provide: PurchaseOrderService,
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
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PurchaseRequisitionService>(PurchaseRequisitionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
