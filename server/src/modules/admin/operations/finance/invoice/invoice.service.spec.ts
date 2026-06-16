import { Test, TestingModule } from '@nestjs/testing'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { InvoiceService as InvoiceServiceBase } from './invoice.service'
import { InvoiceRepository } from './invoice.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InvoiceService } from './invoice.service'

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
      ],
    }).compile()

    service = module.get<InvoiceService>(InvoiceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
