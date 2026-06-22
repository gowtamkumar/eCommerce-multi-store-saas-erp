import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { JournalEntryEntity } from '@/modules/admin/operations/finance/accounting/entities/journal-entry.entity'
import { LedgerEntryEntity } from '@/modules/admin/operations/finance/accounting/entities/ledger-entry.entity'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { CurrencyFeedService } from '@/modules/admin/operations/finance/accounting/services/currency-feed.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { BadRequestException } from '@nestjs/common'

describe('Multi-Currency Accounting (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let accountingService: AccountingService
  let currencyFeedService: CurrencyFeedService
  let tenant: TenantEntity
  let ctx: RequestContextDto

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    accountingService = app.get(AccountingService)
    currencyFeedService = app.get(CurrencyFeedService)

    // Create a mock tenant for testing
    const tenantRepo = dataSource.getRepository(TenantEntity)
    tenant = tenantRepo.create({
      storeName: 'E2E Multi-Currency Store',
      subdomain: `e2e-multi-curr-${Date.now()}`,
    })
    await tenantRepo.save(tenant)

    ctx = new RequestContextDto()
    ctx.tenantId = tenant.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'

    // Initialize Chart of Accounts for this tenant
    await accountingService.initializeTenantCOA(ctx)

    // Set up site settings base currency to USD
    const settingsRepo = dataSource.getRepository(SiteSettingsEntity)
    const settings = settingsRepo.create({
      tenantId: tenant.id,
      currency: 'USD',
      locale: 'en-US',
      brandName: tenant.storeName,
      removeBranding: false,
      probationDays: 90,
      documentExpiryAlertDays: 30,
    })
    await settingsRepo.save(settings)
  })

  afterAll(async () => {
    if (tenant) {
      const tenantRepo = dataSource.getRepository(TenantEntity)
      await tenantRepo.delete(tenant.id)
    }
    if (app) {
      await app.close()
    }
  })

  describe('Forex Bookkeeping & Rounding Tolerances', () => {
    it('should post a transaction in EUR and convert to USD base currency using custom exchange rate', async () => {
      // 1. Post a transaction of 100 EUR using 1.10 rate
      const entry = await accountingService.createJournalEntry(
        {
          type: JournalType.GENERAL,
          description: 'Forex purchase of supplies',
          currency: 'EUR',
          exchangeRate: 1.10,
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 100 },
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 100 },
          ],
        },
        ctx,
      )

      expect(entry).toBeDefined()
      expect(entry.currency).toBe('EUR')
      expect(Number(entry.exchangeRate)).toBe(1.10)
      expect(Number(entry.totalAmount)).toBe(100) // Transaction currency total

      // 2. Query ledger entries and verify conversion
      const ledgerRepo = dataSource.getRepository(LedgerEntryEntity)
      const lines = await ledgerRepo.find({
        where: { journalEntryId: entry.id },
        relations: { account: true },
      })

      expect(lines).toHaveLength(2)
      for (const line of lines) {
        expect(line.transactionCurrency).toBe('EUR')
        expect(Number(line.transactionAmount)).toBe(100)
        expect(Number(line.exchangeRate)).toBe(1.10)
        expect(Number(line.amount)).toBe(110) // 100 EUR * 1.10 = 110 USD base currency amount
      }
    })

    it('should fallback to currency feed rate if exchange rate is not provided', async () => {
      // Seed BDT to BDT rate inside CurrencyFeedService (normally 117.50 for USD/BDT in feed)
      // So BDT -> USD is 1 / 117.50 = 0.008511
      const expectedRate = await currencyFeedService.getExchangeRate('BDT', 'USD')
      expect(expectedRate).toBeGreaterThan(0)

      const entry = await accountingService.createJournalEntry(
        {
          type: JournalType.GENERAL,
          description: 'Forex feed fallback test',
          currency: 'BDT',
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 10000 },
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 10000 },
          ],
        },
        ctx,
      )

      expect(entry).toBeDefined()
      expect(entry.currency).toBe('BDT')
      expect(Number(entry.exchangeRate)).toBe(expectedRate)

      const ledgerRepo = dataSource.getRepository(LedgerEntryEntity)
      const lines = await ledgerRepo.find({ where: { journalEntryId: entry.id } })
      expect(lines).toHaveLength(2)
      for (const line of lines) {
        expect(line.transactionCurrency).toBe('BDT')
        expect(Number(line.transactionAmount)).toBe(10000)
        expect(Number(line.amount)).toBe(Number((10000 * expectedRate).toFixed(2)))
      }
    })

    it('should absorb minor rounding discrepancies (within 0.02) in base currency and balance ledger exactly', async () => {
      // We use exchangeRate = 1.15
      // line 1: DEBIT 10.03 EUR -> 11.53 USD
      // line 2: DEBIT 10.03 EUR -> 11.53 USD
      // Total DEBIT base: 23.06 USD
      // line 3: CREDIT 20.06 EUR -> 23.07 USD
      // Total CREDIT base: 23.07 USD
      // Difference is 0.01 USD (<= 0.02 tolerance).
      // The adjustment logic should modify the last line (credit line 3) from 23.07 to 23.06, or debit line to balance them.
      const entry = await accountingService.createJournalEntry(
        {
          type: JournalType.GENERAL,
          description: 'Rounding discrepancy absorption test',
          currency: 'EUR',
          exchangeRate: 1.15,
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 10.03 },
            { accountCode: '1100', side: LedgerEntrySide.DEBIT, amount: 10.03 },
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 20.06 },
          ],
        },
        ctx,
      )

      expect(entry).toBeDefined()

      const ledgerRepo = dataSource.getRepository(LedgerEntryEntity)
      const lines = await ledgerRepo.find({
        where: { journalEntryId: entry.id },
        order: { amount: 'ASC' },
      })

      expect(lines).toHaveLength(3)

      const debits = lines.filter((l) => l.side === LedgerEntrySide.DEBIT)
      const credits = lines.filter((l) => l.side === LedgerEntrySide.CREDIT)

      const debitSum = debits.reduce((s, l) => s + Number(l.amount), 0)
      const creditSum = credits.reduce((s, l) => s + Number(l.amount), 0)

      // The entries MUST balance exactly in reporting currency!
      expect(debitSum).toBe(creditSum)
    })

    it('should reject transactions exceeding 0.02 base currency rounding imbalance', async () => {
      // In transaction currency it balances:
      // DEBIT 10.00 EUR, DEBIT 10.00 EUR
      // CREDIT 20.00 EUR
      // But if we pass inconsistent manual exchange rates per line, wait, our service uses a single journal-wide exchange rate!
      // Wait, with a single journal-wide exchange rate, is it possible to exceed 0.02 rounding imbalance just from standard rounding?
      // Yes, if we have a very large number of lines. E.g. 5 lines of DEBIT 1.00 EUR at rate 1.005:
      // 1.00 * 1.005 = 1.005 -> 1.01 USD. 5 lines = 5.05 USD.
      // 1 line of CREDIT 5.00 EUR at rate 1.005:
      // 5.00 * 1.005 = 5.025 -> 5.03 USD.
      // Mismatch: 5.05 - 5.03 = 0.02 USD (right at the limit).
      // If we have 10 lines of 1.00 EUR:
      // 10 lines of DEBIT 1.00 EUR -> 10.10 USD.
      // 1 line of CREDIT 10.00 EUR -> 10.05 USD.
      // Mismatch: 0.05 USD (exceeds 0.02 tolerance).
      // Let's verify it gets rejected!
      await expect(
        accountingService.createJournalEntry(
          {
            type: JournalType.GENERAL,
            description: 'Rounding discrepancy rejection test',
            currency: 'EUR',
            exchangeRate: 1.005,
            lines: [
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 1.0 },
              { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 10.0 },
            ],
          },
          ctx,
        ),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
