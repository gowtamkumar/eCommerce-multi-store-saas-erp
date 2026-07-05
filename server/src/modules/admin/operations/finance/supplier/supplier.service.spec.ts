import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SupplierRepository } from './supplier.repository'
import { SupplierAPLedgerRepository } from './supplier-ap-ledger.repository'
import { SupplierService } from './supplier.service'

describe('SupplierService', () => {
  let service: SupplierService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: SupplierRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: SupplierAPLedgerRepository,
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            getBalances: jest.fn().mockResolvedValue(new Map()),
            getBalance: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile()

    service = module.get<SupplierService>(SupplierService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
