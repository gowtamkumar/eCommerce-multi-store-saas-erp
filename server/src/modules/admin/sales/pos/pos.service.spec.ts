import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { ArService } from '@/modules/admin/operations/finance/accounting/services/ar.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { ProductBatchService } from '@/modules/admin/operations/logistics/inventory-transaction/product-batch.service'
import { PosDrawerTransactionRepository } from './repositories/pos-drawer-transaction.repository'
import { PosRegisterRepository } from './repositories/pos-register.repository'
import { PosShiftRepository } from './repositories/pos-shift.repository'
import { PosService } from './pos.service'

describe('PosService', () => {
  let service: PosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PosService,
        {
          provide: PosRegisterRepository,
          useValue: {},
        },
        {
          provide: PosShiftRepository,
          useValue: {},
        },
        {
          provide: PosDrawerTransactionRepository,
          useValue: {},
        },
        {
          provide: InventoryLedgerService,
          useValue: {},
        },
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: ArService,
          useValue: {},
        },
        {
          provide: WalletService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: ProductBatchService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PosService>(PosService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
