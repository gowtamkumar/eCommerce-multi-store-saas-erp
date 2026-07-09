import { Test, TestingModule } from '@nestjs/testing'
import { InventoryLedgerService } from './inventory-ledger.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { StockTransferService } from './stock-transfer.service'
import { StockTransferRepository } from './repositories/stock-transfer.repository'
import { StockTransferItemRepository } from './repositories/stock-transfer-item.repository'

describe('StockTransferService', () => {
  let service: StockTransferService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockTransferService,
        {
          provide: StockTransferRepository,
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
            txRepo: jest.fn().mockReturnValue({
              create: jest.fn(),
              save: jest.fn(),
              findOne: jest.fn(),
            }),
          },
        },
        {
          provide: StockTransferItemRepository,
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
            txRepo: jest.fn().mockReturnValue({
              create: jest.fn(),
              save: jest.fn(),
              findOne: jest.fn(),
            }),
          },
        },
        {
          provide: InventoryLedgerService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<StockTransferService>(StockTransferService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
