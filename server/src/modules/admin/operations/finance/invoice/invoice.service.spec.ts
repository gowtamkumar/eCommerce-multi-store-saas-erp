import { Test, TestingModule } from '@nestjs/testing'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { InvoiceRepository } from './invoice.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InvoiceService } from './invoice.service'
import { AccountingOutboxService } from '@/modules/admin/operations/finance/accounting/services/accounting-outbox.service'

describe('InvoiceService', () => {
  let service: InvoiceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: {},
        },
        {
          provide: OrderRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: AccountingOutboxService,
          useValue: {
            enqueueJournalEntry: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<InvoiceService>(InvoiceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
