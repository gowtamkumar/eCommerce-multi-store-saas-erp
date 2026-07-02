import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { JournalEntryEntity } from '@/modules/admin/operations/finance/accounting/entities/journal-entry.entity'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { PosDrawerTransactionType } from '@/modules/admin/sales/pos/entities/pos-drawer-transaction.entity'
import { PosRegisterEntity } from '@/modules/admin/sales/pos/entities/pos-register.entity'
import { PosShiftEntity } from '@/modules/admin/sales/pos/entities/pos-shift.entity'
import { PosService } from '@/modules/admin/sales/pos/pos.service'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { AppModule } from './../src/app.module'

describe('POS Enhancements (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let posService: PosService
  let accountingService: AccountingService
  let store: StoreEntity
  let ctx: RequestContextDto
  let product: ProductEntity
  let register: PosRegisterEntity
  let shift: PosShiftEntity

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    posService = app.get(PosService)
    accountingService = app.get(AccountingService)

    // Create a mock store for testing
    const storeRepo = dataSource.getRepository(StoreEntity)
    store = storeRepo.create({
      storeName: 'E2E Test POS Enhancements Store',
      subdomain: `e2e-test-pos-${Date.now()}`,
    })
    await storeRepo.save(store)

    ctx = new RequestContextDto()
    ctx.storeId = store.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'

    // Initialize Chart of Accounts
    await accountingService.initializeStoreCOA(ctx)

    // Create a product
    const productRepo = dataSource.getRepository(ProductEntity)
    product = productRepo.create({
      name: 'E2E POS Product',
      slug: `e2e-pos-${Date.now()}`,
      description: 'Test POS product',
      price: 100.0,
      images: [],
      status: ProductStatus.ACTIVE,
      taxRate: 10,
      storeId: store.id,
    })
    await productRepo.save(product)

    // Create a mock branch
    const branchRepo = dataSource.getRepository(BranchEntity)
    const branch = branchRepo.create({
      name: 'Main Branch',
      code: `MB-${Date.now()}`,
      storeId: store.id,
    })
    await branchRepo.save(branch)

    // Create a mock user
    const userRepo = dataSource.getRepository(UserEntity)
    const user = userRepo.create({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'E2E Test User',
      username: `e2etestuser-${Date.now()}`,
      password: 'password',
      storeId: store.id,
    })
    await userRepo.save(user)

    // Create a POS register
    register = await posService.createRegister(
      {
        name: 'Main Register Counter 1',
        branchId: branch.id,
      },
      ctx,
    )

    // Open a shift
    shift = await posService.openShift(
      {
        registerId: register.id,
        openingBalance: 150.0,
      },
      ctx,
    )
  })

  afterAll(async () => {
    if (store) {
      const tables = [
        'order_items',
        'orders',
        'pos_drawer_transactions',
        'pos_shifts',
        'pos_registers',
        'ledger_entries',
        'journal_entries',
        'inventory_ledger',
        'products',
        'users',
        'branches',
        'accounts',
      ]
      for (const table of tables) {
        try {
          await dataSource.query(`DELETE FROM "${table}" WHERE "store_id" = $1`, [store.id])
        } catch (e) {
          // Ignore table deletion errors to continue cleanup
        }
      }
      const storeRepo = dataSource.getRepository(StoreEntity)
      await storeRepo.delete(store.id)
    }
    if (app) {
      await app.close()
    }
  })

  describe('Offline-first Sync & Idempotency', () => {
    it('should process sales with offlineSaleId and prevent double-posting on resync', async () => {
      const offlineSaleId = uuidv4()

      const payload = {
        shiftId: shift.id,
        items: [
          {
            productId: product.id,
            quantity: 2,
            price: 100.0,
          },
        ],
        paymentMethod: PaymentMethod.CASH,
        paymentAmount: 220.0,
        offlineSaleId,
      }

      // First sync attempt
      const result1 = await posService.syncPosSale(payload, ctx)
      expect(result1.success).toBe(true)

      const orderRepo = dataSource.getRepository(OrderEntity)
      const initialOrders = await orderRepo.find({ where: { offlineSaleId } })
      expect(initialOrders).toHaveLength(1)
      const order = initialOrders[0]
      expect(Number(order.totalAmount)).toBe(220.0) // 200 + 20 tax = 220.0

      // Save journal entries count for comparison
      const journalRepo = dataSource.getRepository(JournalEntryEntity)
      const initialJournals = await journalRepo.find({ where: { referenceId: shift.id } })
      expect(initialJournals).toHaveLength(1)

      // Second sync attempt (replay)
      const result2 = await posService.syncPosSale(payload, ctx)
      expect(result2.success).toBe(true)

      // Verify no duplicate order or duplicate journal entries were created
      const subsequentOrders = await orderRepo.find({ where: { offlineSaleId } })
      expect(subsequentOrders).toHaveLength(1)

      const subsequentJournals = await journalRepo.find({ where: { referenceId: shift.id } })
      expect(subsequentJournals).toHaveLength(1)
    })

    it('should override transaction timestamps when createdAt is supplied', async () => {
      const offlineSaleId = uuidv4()
      const pastDate = new Date('2026-05-01T10:00:00Z')

      const payload = {
        shiftId: shift.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: 100.0,
          },
        ],
        paymentMethod: PaymentMethod.CASH,
        paymentAmount: 100.0,
        offlineSaleId,
        createdAt: pastDate.toISOString(),
      }

      const result = await posService.syncPosSale(payload, ctx)
      expect(result.success).toBe(true)

      // Check Order date
      const orderRepo = dataSource.getRepository(OrderEntity)
      const order = await orderRepo.findOne({ where: { offlineSaleId } })
      expect(order).toBeDefined()
      expect(new Date(order.createdAt).toISOString()).toBe(pastDate.toISOString())

      // Check GL Journal Entry date
      const journalRepo = dataSource.getRepository(JournalEntryEntity)
      const journal = await journalRepo.findOne({
        where: {
          description: Like(`%Order ID: ${order.id}%`),
        } as any,
      })
      expect(journal).toBeDefined()
      expect(new Date(journal.createdAt).toISOString()).toBe(pastDate.toISOString())

      // Check Inventory Ledger date
      const ledgerRepo = dataSource.getRepository(InventoryLedgerEntity)
      const ledger = await ledgerRepo.findOne({ where: { referenceId: order.id } })
      expect(ledger).toBeDefined()
      expect(new Date(ledger.createdAt).toISOString()).toBe(pastDate.toISOString())
    })
  })

  describe('Multi-payment Splits', () => {
    it('should support payment breakdowns and accurately update shift aggregates and GL ledger accounts', async () => {
      const offlineSaleId = uuidv4()

      const payload = {
        shiftId: shift.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: 200.0, // 200 total (tax is inclusive)
          },
        ],
        paymentMethod: PaymentMethod.CASH, // backup field
        paymentAmount: 220.0,
        offlineSaleId,
        payments: [
          { method: PaymentMethod.CASH, amount: 110.0 },
          { method: PaymentMethod.CARD, amount: 110.0 },
        ],
      }

      // Record shift balance before
      const shiftRepo = dataSource.getRepository(PosShiftEntity)
      const preShift = await shiftRepo.findOne({ where: { id: shift.id } })
      const cashBefore = Number(preShift.cashSales)
      const cardBefore = Number(preShift.cardSales)

      const result = await posService.syncPosSale(payload, ctx)
      expect(result.success).toBe(true)

      // Verify order has payments breakdown saved
      const orderRepo = dataSource.getRepository(OrderEntity)
      const order = await orderRepo.findOne({ where: { offlineSaleId } })
      expect(order.payments).toHaveLength(2)
      expect(order.payments).toContainEqual({ method: 'cash', amount: 110 })
      expect(order.payments).toContainEqual({ method: 'card', amount: 110 })

      // Verify shift aggregates updated
      const postShift = await shiftRepo.findOne({ where: { id: shift.id } })
      expect(Number(postShift.cashSales) - cashBefore).toBe(110.0)
      expect(Number(postShift.cardSales) - cardBefore).toBe(110.0)

      // Verify GL entries debited the correct amount
      const journalRepo = dataSource.getRepository(JournalEntryEntity)
      const journal = await journalRepo.findOne({
        where: {
          description: Like(`%Order ID: ${order.id}%`),
        } as any,
        relations: ['lines', 'lines.account'],
      })
      expect(journal).toBeDefined()

      // The lines should contain 1000 debit of 220 (Cash + Card split is debited to 1000)
      const debitLine = journal.lines.find(
        (l) => l.account?.code === '1000' && l.side === LedgerEntrySide.DEBIT,
      )
      expect(Number(debitLine.amount)).toBe(220.0)
    })
  })

  describe('Cash Drawer Tracking', () => {
    it('should record cash-in/out and update shift expectedClosingBalance correctly', async () => {
      const shiftRepo = dataSource.getRepository(PosShiftEntity)
      const preShift = await shiftRepo.findOne({ where: { id: shift.id } })
      const expectedBefore = Number(preShift.expectedClosingBalance)

      // 1. Post Cash In
      const tx1 = await posService.createDrawerTransaction(
        shift.id,
        {
          type: PosDrawerTransactionType.CASH_IN,
          amount: 80.0,
          reason: 'Float injection',
        },
        ctx,
      )
      expect(tx1).toBeDefined()
      expect(tx1.type).toBe(PosDrawerTransactionType.CASH_IN)
      expect(Number(tx1.amount)).toBe(80.0)

      // 2. Post Cash Out
      const tx2 = await posService.createDrawerTransaction(
        shift.id,
        {
          type: PosDrawerTransactionType.CASH_OUT,
          amount: 30.0,
          reason: 'Petty cash purchase',
        },
        ctx,
      )
      expect(tx2).toBeDefined()
      expect(tx2.type).toBe(PosDrawerTransactionType.CASH_OUT)
      expect(Number(tx2.amount)).toBe(30.0)

      // 3. Verify Shift Expected closing balance
      const postShift = await shiftRepo.findOne({ where: { id: shift.id } })
      expect(Number(postShift.cashIn)).toBe(80.0)
      expect(Number(postShift.cashOut)).toBe(30.0)
      expect(Number(postShift.expectedClosingBalance)).toBe(expectedBefore + 80.0 - 30.0)

      // 4. Retrieve drawer transactions
      const txs = await posService.getDrawerTransactionsForShift(shift.id, ctx)
      expect(txs).toHaveLength(2)
      expect(txs.map((t) => t.type)).toContain(PosDrawerTransactionType.CASH_IN)
      expect(txs.map((t) => t.type)).toContain(PosDrawerTransactionType.CASH_OUT)
    })
  })
})

// Helper function to mock typeorm Like since it's not imported
function Like(val: string) {
  return require('typeorm').Like(val)
}
