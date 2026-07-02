import { Test, TestingModule } from '@nestjs/testing'
import { DataSource, EntityManager } from 'typeorm'
import { AccountingService } from './accounting.service'
import { CurrencyFeedService } from './currency-feed.service'
import { LedgerEntrySide, JournalType } from '@/common/enums/journal-type.enum'
import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'
import { AccountEntity } from '../entities/account.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'

describe('AccountingForexService', () => {
  let service: AccountingService
  let mockEntityManager: any
  let mockCurrencyFeedService: any

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((entityClass, plainObject) => {
        return {
          id: 'mock-id',
          ...plainObject,
        }
      }),
      save: jest.fn((entityClass, instances) => {
        return instances
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // open fiscal period
      }),
    }

    mockCurrencyFeedService = {
      getExchangeRate: jest.fn().mockResolvedValue(1.10),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: DataSource,
          useValue: {
            manager: mockEntityManager,
            getRepository: jest.fn().mockReturnValue({
              count: jest.fn().mockResolvedValue(1),
            }),
          },
        },
        {
          provide: CurrencyFeedService,
          useValue: mockCurrencyFeedService,
        },
      ],
    }).compile()

    service = module.get<AccountingService>(AccountingService)
  })

  it('should balance standard journal entries with no forex discrepancy', async () => {
    // Mock site settings (base currency USD)
    mockEntityManager.findOne.mockImplementation((entityClass, options) => {
      if (entityClass === SiteSettingsEntity) {
        return Promise.resolve({ currency: 'USD' })
      }
      return Promise.resolve(null)
    })

    // Mock accounts
    mockEntityManager.find.mockImplementation((entityClass, options) => {
      if (entityClass === AccountEntity) {
        return Promise.resolve([
          { code: '1000', name: 'Cash', type: AccountType.ASSET, category: AccountCategory.CASH_BANK, balance: 1000 },
          { code: '4000', name: 'Revenue', type: AccountType.REVENUE, category: AccountCategory.SALES, balance: 5000 },
        ])
      }
      return Promise.resolve([])
    })

    const ctx = { storeId: 'store-1' } as any
    const data = {
      type: JournalType.SALES,
      description: 'Standard Sale in base currency',
      currency: 'USD',
      exchangeRate: 1.0,
      lines: [
        { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 100 },
        { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 100 },
      ],
    }

    const result = await service.createJournalEntry(data, ctx, mockEntityManager)
    expect(result).toBeDefined()
    expect(result.exchangeRate).toBe(1.0)
    
    // verify lines saved
    const saveCalls = mockEntityManager.save.mock.calls
    // Save should be called with AccountEntity and LedgerEntryEntity
    const ledgerEntries = saveCalls.find(call => Array.isArray(call[1]) && call[1][0]?.journalEntryId)?.[1]
    expect(ledgerEntries).toBeDefined()
    expect(ledgerEntries.length).toBe(2)
    expect(ledgerEntries[0].amount).toBe(100.00) // baseAmount
    expect(ledgerEntries[1].amount).toBe(100.00) // baseAmount
  })

  it('should insert balancing Forex line to account 8000 when multi-currency discrepancy exceeds 0.02', async () => {
    // Mock site settings (base currency USD)
    mockEntityManager.findOne.mockImplementation((entityClass, options) => {
      if (entityClass === SiteSettingsEntity) {
        return Promise.resolve({ currency: 'USD' })
      }
      if (entityClass === AccountEntity && options?.where?.code === '8000') {
        // Return existing or mock finding
        return Promise.resolve({ code: '8000', name: 'Forex', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE, balance: 0 })
      }
      return Promise.resolve(null)
    })

    // Mock accounts
    mockEntityManager.find.mockImplementation((entityClass, options) => {
      if (entityClass === AccountEntity) {
        return Promise.resolve([
          { code: '1000', name: 'Cash', type: AccountType.ASSET, category: AccountCategory.CASH_BANK, balance: 1000 },
          { code: '4000', name: 'Revenue', type: AccountType.REVENUE, category: AccountCategory.SALES, balance: 5000 },
          { code: '8000', name: 'Forex', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE, balance: 0 },
        ])
      }
      return Promise.resolve([])
    })

    const ctx = { storeId: 'store-1' } as any
    const data = {
      type: JournalType.SALES,
      description: 'Forex Discrepancy Sale',
      currency: 'EUR',
      exchangeRate: 1.05,
      lines: [
        // Debit: 100 EUR @ line-level 1.10 rate = 110.00 base amount
        { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 100, exchangeRate: 1.10 },
        // Credit: 100 EUR @ header 1.05 rate = 105.00 base amount
        { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 100 },
      ],
    }

    const result = await service.createJournalEntry(data, ctx, mockEntityManager)
    expect(result).toBeDefined()
    expect(result.exchangeRate).toBe(1.05)

    const saveCalls = mockEntityManager.save.mock.calls
    const ledgerEntries = saveCalls.find(call => Array.isArray(call[1]) && call[1][0]?.journalEntryId)?.[1]
    expect(ledgerEntries).toBeDefined()
    
    // We expect 3 lines: Debit Cash 110, Credit Revenue 105, and Credit Forex 5.00 to balance
    expect(ledgerEntries.length).toBe(3)
    
    const cashLine = ledgerEntries.find(l => l.accountId === undefined && l.transactionAmount === 100 && l.side === LedgerEntrySide.DEBIT)
    const revLine = ledgerEntries.find(l => l.accountId === undefined && l.transactionAmount === 100 && l.side === LedgerEntrySide.CREDIT)
    const forexLine = ledgerEntries.find(l => l.transactionAmount === 0 && l.side === LedgerEntrySide.CREDIT)

    expect(cashLine.amount).toBe(110.00)
    expect(cashLine.exchangeRate).toBe(1.10)
    expect(revLine.amount).toBe(105.00)
    expect(revLine.exchangeRate).toBe(1.05)
    
    expect(forexLine).toBeDefined()
    expect(forexLine.amount).toBe(5.00) // 5.00 base balancing amount
    expect(forexLine.transactionAmount).toBe(0)
    expect(forexLine.exchangeRate).toBe(0)
  })
})
