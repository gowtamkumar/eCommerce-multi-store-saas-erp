import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { GrnRepository } from './grn.repository'
import { SupplierAPLedgerRepository } from '@/modules/admin/operations/finance/supplier/supplier-ap-ledger.repository'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { GrnService } from './grn.service'

describe('GrnService', () => {
  let service: GrnService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrnService,
        {
          provide: GrnRepository,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: SupplierAPLedgerRepository,
          useValue: {},
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

    service = module.get<GrnService>(GrnService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
