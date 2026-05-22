import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { ArLedgerEntity } from '@/modules/admin/operations/finance/accounting/entities/ar-ledger.entity'
import { DunningRuleEntity } from '@/modules/admin/operations/finance/accounting/entities/dunning-rule.entity'
import { DunningLogEntity } from '@/modules/admin/operations/finance/accounting/entities/dunning-log.entity'
import { LoyaltyRuleEntity } from '@/modules/admin/marketing/loyalty/entities/loyalty-rule.entity'
import { LoyaltyConfigEntity } from '@/modules/admin/marketing/loyalty/entities/loyalty-config.entity'
import { LoyaltyLedgerEntity } from '@/modules/admin/marketing/loyalty/entities/loyalty-ledger.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { DunningService } from '@/modules/admin/operations/finance/accounting/services/dunning.service'
import { LoyaltyService } from '@/modules/admin/marketing/loyalty/services/loyalty.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { v4 as uuidv4 } from 'uuid'

describe('CRM: Dunning & Loyalty (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let dunningService: DunningService
  let loyaltyService: LoyaltyService
  let tenant: TenantEntity
  let ctx: RequestContextDto
  let customer: UserEntity

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    dunningService = app.get(DunningService)
    loyaltyService = app.get(LoyaltyService)

    // Mock MailService to prevent DNS lookups or socket connections from hanging the test
    const mailService = app.get(MailService)
    jest.spyOn(mailService, 'sendGenericEmail').mockResolvedValue(undefined as any)

    // Create a mock tenant for testing
    const tenantRepo = dataSource.getRepository(TenantEntity)
    tenant = tenantRepo.create({
      storeName: 'E2E Test CRM Store',
      subdomain: `e2e-test-crm-${Date.now()}`,
    })
    await tenantRepo.save(tenant)

    ctx = new RequestContextDto()
    ctx.tenantId = tenant.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'

    // Create a customer user
    const userRepo = dataSource.getRepository(UserEntity)
    customer = userRepo.create({
      id: uuidv4(),
      name: 'B2B Wholesale Customer',
      username: `b2bcust-${Date.now()}`,
      password: 'password',
      email: 'b2b-customer@example.com',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      tenantId: tenant.id,
      membershipTier: 'SILVER',
      creditLimit: 5000.00,
      creditHold: false,
      loyaltyPointsBalance: 0,
      companyName: 'Wholesale Corp',
    })
    await userRepo.save(customer)
  })

  afterAll(async () => {
    if (tenant) {
      const tables = [
        'loyalty_ledger',
        'loyalty_rules',
        'loyalty_config',
        'dunning_logs',
        'dunning_rules',
        'ar_ledger',
        'order_items',
        'orders',
        'products',
        'categories',
        'users',
      ]
      for (const table of tables) {
        try {
          await dataSource.query(`DELETE FROM "${table}" WHERE "tenant_id" = $1`, [tenant.id])
        } catch (e) {
          // Ignore
        }
      }
      const tenantRepo = dataSource.getRepository(TenantEntity)
      await tenantRepo.delete(tenant.id)
    }
    if (app) {
      await app.close()
    }
  })

  describe('AR Aging & Dunning Notice Rules', () => {
    let dunningRule: DunningRuleEntity

    beforeAll(async () => {
      // 1. Create a Dunning rule (30 days overdue, EMAIL_AND_HOLD action)
      const dunningRuleRepo = dataSource.getRepository(DunningRuleEntity)
      dunningRule = dunningRuleRepo.create({
        tenantId: tenant.id,
        dunningLevel: 1,
        daysOverdue: 30,
        action: 'EMAIL_AND_HOLD',
        emailSubject: 'URGENT: Overdue Account Balance',
        emailBody: 'Dear {{customerName}}, your account is {{daysOverdue}} days overdue with {{amountOverdue}} outstanding.',
      })
      await dunningRuleRepo.save(dunningRule)
    })

    it('should calculate oldest overdue invoice using FIFO, trigger hold, and create a log', async () => {
      const arLedgerRepo = dataSource.getRepository(ArLedgerEntity)
      const userRepo = dataSource.getRepository(UserEntity)
      const dunningLogRepo = dataSource.getRepository(DunningLogEntity)

      // 2. Insert an overdue invoice (35 days ago)
      const invoiceDate = new Date()
      invoiceDate.setDate(invoiceDate.getDate() - 35)

      const overdueInvoice = arLedgerRepo.create({
        tenantId: tenant.id,
        customerId: customer.id,
        type: ArTransactionType.INVOICE,
        amount: 800.00,
        balanceAfter: 800.00,
        currency: 'USD',
        dueDate: invoiceDate,
        createdAt: invoiceDate,
      })
      await arLedgerRepo.save(overdueInvoice)

      // Ensure customer has creditHold = false before audit
      customer.creditHold = false
      await userRepo.save(customer)

      // 3. Run audit sweep
      const result = await dunningService.runDunningAudit(ctx)
      expect(result.processed).toBe(1)
      expect(result.logsCreated).toBe(1)

      // 4. Verify customer is placed on credit hold
      const updatedCustomer = await userRepo.findOne({ where: { id: customer.id } })
      expect(updatedCustomer?.creditHold).toBe(true)

      // 5. Verify dunning log is created
      const logs = await dunningLogRepo.find({
        where: { tenantId: tenant.id, customerId: customer.id },
        relations: ['dunningRule'],
      })
      expect(logs.length).toBe(1)
      expect(logs[0].actionTaken).toBe('EMAIL_AND_HOLD')
      expect(Number(logs[0].triggeredAmountOverdue)).toBe(800.00)
      expect(logs[0].emailSubject).toBe('URGENT: Overdue Account Balance')
      expect(logs[0].emailBody).toContain('Dear B2B Wholesale Customer, your account is')
      expect(logs[0].emailBody).toContain('outstanding.')
    })

    it('should skip duplicate dunning alerts for the same overdue cycle', async () => {
      // Run audit again immediately
      const result = await dunningService.runDunningAudit(ctx)
      // Should not create new logs since the duplicate log check prevents it
      expect(result.logsCreated).toBe(0)
    })
  })

  describe('Dynamic Loyalty Rules Engine', () => {
    let categoryId: string
    let matchedProduct: ProductEntity
    let unmatchedProduct: ProductEntity

    beforeAll(async () => {
      const productRepo = dataSource.getRepository(ProductEntity)
      const categoryRepo = dataSource.getRepository(CategoryEntity)

      // Create categories
      const matchedCat = categoryRepo.create({
        name: 'Matched Promo Category',
        slug: `promo-cat-${Date.now()}`,
        tenantId: tenant.id,
      })
      await categoryRepo.save(matchedCat)
      categoryId = matchedCat.id

      const unmatchedCat = categoryRepo.create({
        name: 'Normal Category',
        slug: `norm-cat-${Date.now()}`,
        tenantId: tenant.id,
      })
      await categoryRepo.save(unmatchedCat)

      // Create products
      matchedProduct = productRepo.create({
        name: 'Loyalty Promo Product',
        slug: `promo-prod-${Date.now()}`,
        description: 'Promo product',
        price: 100.00,
        images: [],
        status: ProductStatus.ACTIVE,
        taxRate: 0,
        tenantId: tenant.id,
        categoryId: matchedCat.id,
      })
      await productRepo.save(matchedProduct)

      unmatchedProduct = productRepo.create({
        name: 'Normal Product',
        slug: `norm-prod-${Date.now()}`,
        description: 'Normal product',
        price: 150.00,
        images: [],
        status: ProductStatus.ACTIVE,
        taxRate: 0,
        tenantId: tenant.id,
        categoryId: unmatchedCat.id, // Different category
      })
      await productRepo.save(unmatchedProduct)

      // Update Loyalty Config
      const config = await loyaltyService.getOrCreateConfig(tenant.id)
      config.isEnabled = true
      config.pointsPerCurrencySpent = 1.00
      config.silverMultiplier = 1.50
      await dataSource.manager.save(config)

      // Create dynamic loyalty rules
      const ruleRepo = dataSource.getRepository(LoyaltyRuleEntity)

      // 1. Category multiplier: 2.0x for categoryId
      const catRule = ruleRepo.create({
        tenantId: tenant.id,
        name: 'Category Promo',
        type: 'CATEGORY_MULTIPLIER',
        value: 2.00,
        conditions: { categoryIds: [categoryId] },
        isActive: true,
      })
      await ruleRepo.save(catRule)

      // 2. Weekend multiplier: 3.0x
      const weekendRule = ruleRepo.create({
        tenantId: tenant.id,
        name: 'Weekend Triple Points',
        type: 'WEEKEND_MULTIPLIER',
        value: 3.00,
        isActive: true,
      })
      await ruleRepo.save(weekendRule)

      // 3. Min spend bonus: 100 points for spending >= 200
      const minSpendRule = ruleRepo.create({
        tenantId: tenant.id,
        name: 'Big Spend Bonus',
        type: 'MIN_SPEND_BONUS',
        value: 100.00,
        conditions: { minSpend: 200 },
        isActive: true,
      })
      await ruleRepo.save(minSpendRule)
    })

    it('should process order earning with category, weekend, and spend bonus calculations', async () => {
      const orderRepo = dataSource.getRepository(OrderEntity)
      const orderItemRepo = dataSource.getRepository(OrderItemEntity)
      const userRepo = dataSource.getRepository(UserEntity)
      const loyaltyLedgerRepo = dataSource.getRepository(LoyaltyLedgerEntity)

      // Reset customer points balance and ensure tier is SILVER
      customer.loyaltyPointsBalance = 0
      customer.membershipTier = 'SILVER'
      await userRepo.save(customer)

      // Create order created on a Saturday (2026-05-23)
      const orderDate = new Date('2026-05-23T12:00:00Z')

      const order = orderRepo.create({
        tenantId: tenant.id,
        userId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: '1234567890',
        address: 'Test Address',
        totalAmount: 250.00,
        createdAt: orderDate,
      })
      await orderRepo.save(order)

      const item1 = orderItemRepo.create({
        tenantId: tenant.id,
        orderId: order.id,
        productId: matchedProduct.id,
        product: matchedProduct,
        quantity: 1,
        unitPrice: 100.00,
        totalAmount: 100.00,
      })

      const item2 = orderItemRepo.create({
        tenantId: tenant.id,
        orderId: order.id,
        productId: unmatchedProduct.id,
        product: unmatchedProduct,
        quantity: 1,
        unitPrice: 150.00,
        totalAmount: 150.00,
      })

      await orderItemRepo.save([item1, item2])

      // Attach items to order for processOrderEarning
      order.items = [item1, item2]

      // Process loyalty earning inside transaction due to pessimistic lock
      await dataSource.transaction(async (manager) => {
        await loyaltyService.processOrderEarning(order, ctx, manager)
      })

      // Expected Points calculation:
      // Points per currency: 1.0, Silver tier multiplier: 1.5x
      // Item 1 (Category Promo 2.0x): 100 * 1.0 * 1.5 * 2.0 = 300
      // Item 2 (No Category Promo): 150 * 1.0 * 1.5 * 1.0 = 225
      // Total Item Points = 525
      // Weekend multiplier (Saturday): 3.0x -> Math.floor(525 * 3) = 1575
      // Min Spend Bonus: order total 250 >= 200 -> +100 bonus
      // Total points to earn: 1575 + 100 = 1675

      const updatedCustomer = await userRepo.findOne({ where: { id: customer.id } })
      expect(updatedCustomer?.loyaltyPointsBalance).toBe(1675)

      // Check loyalty ledger entry
      const ledgerEntries = await loyaltyLedgerRepo.find({
        where: { tenantId: tenant.id, customerId: customer.id },
      })
      expect(ledgerEntries.length).toBe(1)
      expect(ledgerEntries[0].points).toBe(1675)
      expect(ledgerEntries[0].balanceAfter).toBe(1675)
      expect(ledgerEntries[0].note).toContain('Earned points from Order')
      expect(ledgerEntries[0].note).toContain('Weekend multiplier 3x')
      expect(ledgerEntries[0].note).toContain('Spend bonus of 100 pts')
    })
  })
})
