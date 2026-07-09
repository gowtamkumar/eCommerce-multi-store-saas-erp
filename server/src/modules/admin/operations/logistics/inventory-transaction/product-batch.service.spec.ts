import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { InventoryLedgerService } from './inventory-ledger.service'
import { ProductBatchService } from './product-batch.service'
import { ProductBatchRepository } from './repositories/product-batch.repository'

describe('ProductBatchService', () => {
  let service: ProductBatchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductBatchService,
        {
          provide: ProductBatchRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: InventoryLedgerService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<ProductBatchService>(ProductBatchService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
