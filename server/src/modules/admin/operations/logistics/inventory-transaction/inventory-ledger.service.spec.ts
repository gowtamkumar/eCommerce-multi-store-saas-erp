import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { InventoryLedgerRepository } from './inventory-ledger.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/repositories/variant.repository'
import { CacheService } from '../../infra/cache/cache.service'
import { CogsService } from '@/modules/admin/operations/finance/accounting/services/cogs.service'
import { AccountingIntegrationService } from '@/modules/admin/operations/finance/accounting/services/accounting-integration.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { InventoryLedgerService } from './inventory-ledger.service'

describe('InventoryLedgerService', () => {
  let service: InventoryLedgerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryLedgerService,
        {
          provide: InventoryLedgerRepository,
          useValue: {},
        },
        {
          provide: ProductRepository,
          useValue: {},
        },
        {
          provide: ProductVariantRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: CogsService,
          useValue: {},
        },
        {
          provide: AccountingIntegrationService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {
            sendLowStockAlertEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<InventoryLedgerService>(InventoryLedgerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
