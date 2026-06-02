import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { JournalEntryEntity } from '@/modules/admin/operations/finance/accounting/entities/journal-entry.entity'
import { LedgerEntryEntity } from '@/modules/admin/operations/finance/accounting/entities/ledger-entry.entity'
import {
  FiscalPeriodEntity,
  FiscalPeriodStatus,
} from '@/modules/admin/operations/finance/accounting/entities/fiscal-period.entity'
import { AccountingOutboxEntity } from '@/modules/admin/operations/finance/accounting/entities/accounting-outbox.entity'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { AccountingOutboxService } from '@/modules/admin/operations/finance/accounting/services/accounting-outbox.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { BadRequestException } from '@nestjs/common'

describe('Accounting Module (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let accountingService: AccountingService
  let outboxService: AccountingOutboxService
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
    outboxService = app.get(AccountingOutboxService)

    // Create a mock tenant for testing
    const tenantRepo = dataSource.getRepository(TenantEntity)
    tenant = tenantRepo.create({
      storeName: 'E2E Test Accounting Store',
      subdomain: `e2e-test-acc-${Date.now()}`,
    })
    await tenantRepo.save(tenant)

    ctx = new RequestContextDto()
    ctx.tenantId = tenant.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'

    // Initialize Chart of Accounts for this tenant
    await accountingService.initializeTenantCOA(ctx)
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

  describe('Journal Immutability', () => {
    it('should block updates and deletes of posted journal entries', async () => {
      // Create a journal entry
      const entry = await accountingService.createJournalEntry(
        {
          type: JournalType.GENERAL,
          description: 'Immutability test entry',
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 100 },
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 100 },
          ],
        },
        ctx,
      )

      expect(entry).toBeDefined()
      expect(entry.id).toBeDefined()

      const journalRepo = dataSource.getRepository(JournalEntryEntity)
      const ledgerRepo = dataSource.getRepository(LedgerEntryEntity)

      // Verify updating fails
      entry.description = 'Try updating me'
      await expect(journalRepo.save(entry)).rejects.toThrow(
        'Journal entries are immutable and cannot be updated or deleted.',
      )

      // Verify updating ledger lines fails
      const firstLine = await ledgerRepo.findOne({ where: { journalEntryId: entry.id } })
      expect(firstLine).toBeDefined()
      firstLine.amount = 200
      await expect(ledgerRepo.save(firstLine)).rejects.toThrow(
        'Ledger entries are immutable and cannot be updated or deleted.',
      )

      // Verify removing entry fails
      await expect(journalRepo.remove(entry)).rejects.toThrow(
        'Journal entries are immutable and cannot be updated or deleted.',
      )

      // Verify removing lines fails
      await expect(ledgerRepo.remove(firstLine)).rejects.toThrow(
        'Ledger entries are immutable and cannot be updated or deleted.',
      )
    })
  })

  describe('Journal Reversals', () => {
    it('should reverse a journal entry by swapping debits/credits and linking it as a reversal', async () => {
      // Create a journal entry
      const entry = await accountingService.createJournalEntry(
        {
          type: JournalType.SALES,
          description: 'Reversal test source entry',
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 500 },
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 500 },
          ],
        },
        ctx,
      )

      expect(entry.isReversal).toBeFalsy()

      // Perform reversal
      const reversed = await accountingService.reverseJournalEntry(entry.id, ctx)

      expect(reversed).toBeDefined()
      expect(reversed.isReversal).toBeTruthy()
      expect(reversed.reversedJournalEntryId).toBe(entry.id)
      expect(reversed.description).toContain('Reversal of:')
      expect(reversed.description).toContain(entry.id)

      // Retrieve ledger lines of reversed entry and verify swapped sides
      const journalRepo = dataSource.getRepository(JournalEntryEntity)
      const fullReversal = await journalRepo.findOne({
        where: { id: reversed.id },
        relations: ['lines', 'lines.account'],
      })

      expect(fullReversal.lines).toHaveLength(2)
      const debitLine = fullReversal.lines.find((l) => l.side === LedgerEntrySide.DEBIT)
      const creditLine = fullReversal.lines.find((l) => l.side === LedgerEntrySide.CREDIT)

      // Original debit was 1000 (Cash). Reversal should have 1000 (Cash) as CREDIT
      expect(debitLine.account.code).toBe('4000') // Now debit is Revenue (4000)
      expect(creditLine.account.code).toBe('1000') // Now credit is Cash (1000)

      // Attempt to reverse again should fail
      await expect(accountingService.reverseJournalEntry(entry.id, ctx)).rejects.toThrow(
        BadRequestException,
      )

      // Attempt to reverse a reversal entry should fail
      await expect(accountingService.reverseJournalEntry(reversed.id, ctx)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('Fiscal Period Blocking', () => {
    it('should block postings to closed fiscal periods', async () => {
      const fiscalRepo = dataSource.getRepository(FiscalPeriodEntity)

      const closedPeriod = fiscalRepo.create({
        name: 'Closed Year 2020',
        startDate: new Date('2020-01-01T00:00:00Z'),
        endDate: new Date('2020-12-31T23:59:59Z'),
        status: FiscalPeriodStatus.CLOSED,
        tenantId: tenant.id,
      })
      await fiscalRepo.save(closedPeriod)

      // Try posting inside closed period date range
      await expect(
        accountingService.createJournalEntry(
          {
            date: new Date('2020-06-15T00:00:00Z'),
            type: JournalType.GENERAL,
            description: 'Closed period post test',
            lines: [
              { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: 150 },
              { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: 150 },
            ],
          },
          ctx,
        ),
      ).rejects.toThrow(BadRequestException)

      // Clean up closed period
      await fiscalRepo.delete(closedPeriod.id)
    })
  })

  describe('Accounting Outbox Pattern', () => {
    it('should enqueue and asynchronously process journal entries via the outbox', async () => {
      const outboxRepo = dataSource.getRepository(AccountingOutboxEntity)
      const journalRepo = dataSource.getRepository(JournalEntryEntity)

      const journalData = {
        type: JournalType.PURCHASE,
        description: 'Outbox testing entry',
        lines: [
          { accountCode: '1100', side: LedgerEntrySide.DEBIT, amount: 800 },
          { accountCode: '2100', side: LedgerEntrySide.CREDIT, amount: 800 },
        ],
      }

      // 1. Enqueue entry
      const outboxEntry = await outboxService.enqueueJournalEntry(journalData, ctx)

      expect(outboxEntry).toBeDefined()
      expect(outboxEntry.status).toBe('PENDING')
      expect(outboxEntry.attempts).toBe(0)

      // 2. Process outbox entries
      await outboxService.processPending()

      // 3. Verify status changed to PROCESSED
      const updatedOutbox = await outboxRepo.findOne({ where: { id: outboxEntry.id } })
      expect(updatedOutbox.status).toBe('PROCESSED')
      expect(updatedOutbox.attempts).toBe(1)
      expect(updatedOutbox.processedAt).toBeDefined()
      expect(updatedOutbox.error).toBeNull()

      // 4. Verify corresponding Journal Entry is created
      const matchingJournal = await journalRepo.findOne({
        where: {
          tenantId: tenant.id,
          description: 'Outbox testing entry',
        },
      })
      expect(matchingJournal).toBeDefined()
      expect(Number(matchingJournal.totalAmount)).toBe(800)
    })

    it('should handle failures, log error message, increment attempts, and retry', async () => {
      const outboxRepo = dataSource.getRepository(AccountingOutboxEntity)

      // Invalid journal data (mismatched debit and credit sums)
      const invalidJournalData = {
        type: JournalType.PURCHASE,
        description: 'Invalid outbox entry',
        lines: [
          { accountCode: '1100', side: LedgerEntrySide.DEBIT, amount: 800 },
          { accountCode: '2100', side: LedgerEntrySide.CREDIT, amount: 700 }, // unbalanced
        ],
      }

      // Enqueue
      const outboxEntry = await outboxService.enqueueJournalEntry(invalidJournalData, ctx)

      // Process
      await outboxService.processPending()

      // Check status is FAILED and attempts = 1
      let updatedOutbox = await outboxRepo.findOne({ where: { id: outboxEntry.id } })
      expect(updatedOutbox.status).toBe('FAILED')
      expect(updatedOutbox.attempts).toBe(1)
      expect(updatedOutbox.error).toContain('Unbalanced journal entry')

      // Process again -> should retry and fail again
      await outboxService.processPending()

      updatedOutbox = await outboxRepo.findOne({ where: { id: outboxEntry.id } })
      expect(updatedOutbox.status).toBe('FAILED')
      expect(updatedOutbox.attempts).toBe(2)

      // Clean up the outbox test entries
      await outboxRepo.delete(outboxEntry.id)
    })
  })
})
