import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { QuotationRepository } from '../repositories/quotation.repository'
import { RfqRepository } from '../repositories/rfq.repository'
import { PurchaseOrderService } from './purchase-order.service'
import { RfqService } from './rfq.service'

describe('RfqService', () => {
  let service: RfqService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfqService,
        {
          provide: RfqRepository,
          useValue: {},
        },
        {
          provide: QuotationRepository,
          useValue: {},
        },
        {
          provide: PurchaseOrderService,
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

    service = module.get<RfqService>(RfqService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
