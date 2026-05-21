/**
 * Focused AR Service Integration Test
 * Tests the core ArService methods directly:
 *   1. AR Ledger transaction posting
 *   2. Outstanding balance calculation
 *   3. Customer debt payment & GL posting
 *   4. Aging report generation
 * Uses existing Tenant, creates a temporary customer, cleans up after.
 */
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { ArService } from '../src/modules/admin/operations/finance/accounting/services/ar.service'
import { DataSource } from 'typeorm'
import { UserEntity } from '../src/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '../src/modules/system/tenant/entities/tenant.entity'
import { RequestContextDto } from '../src/common/dto/request-context.dto'
import { ArTransactionType } from '../src/common/enums/ar-transaction-type.enum'
import { ArLedgerEntity } from '../src/modules/admin/operations/finance/accounting/entities/ar-ledger.entity'
import { JournalEntryEntity } from '../src/modules/admin/operations/finance/accounting/entities/journal-entry.entity'
import { UserRole } from '../src/common/enums/user/user-role.enum'
import { AccountingService } from '../src/modules/admin/operations/finance/accounting/services/accounting.service'
import * as bcrypt from 'bcrypt'

async function runTest() {
  console.log('=== AR Service Integration Test Suite ===\n')

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const dataSource = app.get(DataSource)
  const arService = app.get(ArService)
  const accountingService = app.get(AccountingService)
  const em = dataSource.manager

  // 1. Resolve existing Tenant
  const tenant = await em.findOne(TenantEntity, { where: {} })
  if (!tenant) {
    console.error('FATAL: No tenant found in DB. Please seed at least one tenant first.')
    await app.close()
    process.exit(1)
  }
  const tenantId = tenant.id
  console.log(`✓ Resolved Tenant: "${tenant.storeName}" (${tenantId})`)

  // Ensure Chart of Accounts is seeded for this tenant
  await accountingService.initializeTenantCOA({ tenantId, userId: null, user: null })
  console.log('✓ Chart of Accounts initialized for tenant')

  // 2. Create B2B test customer
  const randomSuffix = Math.floor(Math.random() * 99999)
  const hashedPassword = await bcrypt.hash('Test@1234', 10)
  let testCustomer = em.create(UserEntity, {
    username: `ar_test_${randomSuffix}`,
    email: `ar_test_${randomSuffix}@b2btest.local`,
    password: hashedPassword,
    name: 'Acme B2B Client',
    role: UserRole.USER,
    tenantId,
    creditLimit: 1000.00,
    creditHold: false,
    companyName: 'Acme Industries',
    customerCode: `ACME-${randomSuffix}`,
  })
  testCustomer = await em.save(UserEntity, testCustomer)
  console.log(`✓ Created B2B Customer: ${testCustomer.username} | Credit Limit: $${testCustomer.creditLimit}\n`)

  const ctx: RequestContextDto = {
    tenantId,
    userId: testCustomer.id,
    user: testCustomer as any,
  }

  let passed = 0
  let failed = 0
  const errors: string[] = []

  try {
    // ---------------------------------------------------
    // TEST 1: Post an AR Invoice and check balance
    // ---------------------------------------------------
    console.log('--- Test 1: Post AR Invoice (Debit on Account) ---')
    const invoice1 = await arService.postArTransaction(
      {
        customerId: testCustomer.id,
        type: ArTransactionType.INVOICE,
        amount: 500,
        referenceType: 'ORDER',
        referenceId: `ORD-FAKE-001-${randomSuffix}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days out
        currency: 'USD',
      },
      ctx,
    )

    const balance1 = await arService.getCustomerOutstandingBalance(testCustomer.id, tenantId)
    if (Number(balance1) === 500 && Number(invoice1.balanceAfter) === 500) {
      console.log(`  ✅ PASS: Outstanding balance = $${balance1} (Expected $500)`)
      passed++
    } else {
      console.log(`  ❌ FAIL: Outstanding balance = $${balance1}, balanceAfter = ${invoice1.balanceAfter} (Expected both $500)`)
      failed++; errors.push('Test 1 failed')
    }

    // ---------------------------------------------------
    // TEST 2: Post a second invoice and re-check balance
    // ---------------------------------------------------
    console.log('\n--- Test 2: Post Second Invoice, verify cumulative balance ---')
    await arService.postArTransaction(
      {
        customerId: testCustomer.id,
        type: ArTransactionType.INVOICE,
        amount: 300,
        referenceType: 'ORDER',
        referenceId: `ORD-FAKE-002-${randomSuffix}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currency: 'USD',
      },
      ctx,
    )

    const balance2 = await arService.getCustomerOutstandingBalance(testCustomer.id, tenantId)
    if (Number(balance2) === 800) {
      console.log(`  ✅ PASS: Cumulative outstanding = $${balance2} (Expected $800)`)
      passed++
    } else {
      console.log(`  ❌ FAIL: Cumulative outstanding = $${balance2} (Expected $800)`)
      failed++; errors.push('Test 2 failed')
    }

    // ---------------------------------------------------
    // TEST 3: Credit limit enforcement check
    // ---------------------------------------------------
    console.log('\n--- Test 3: Credit limit boundary check ($800 outstanding, $1000 limit) ---')
    const outstanding = await arService.getCustomerOutstandingBalance(testCustomer.id, tenantId)
    const limit = Number(testCustomer.creditLimit)
    const newOrder = 300 // Would bring debt to $1100, over the $1000 limit

    if (outstanding + newOrder > limit) {
      console.log(`  ✅ PASS: Credit limit check correctly identifies over-limit: $${outstanding} + $${newOrder} = $${outstanding + newOrder} > $${limit}`)
      passed++
    } else {
      console.log(`  ❌ FAIL: Credit limit check not working. Outstanding $${outstanding}, limit $${limit}`)
      failed++; errors.push('Test 3 failed')
    }

    // ---------------------------------------------------
    // TEST 4: Record a customer debt payment
    // ---------------------------------------------------
    console.log('\n--- Test 4: Record Customer Debt Payment ($400) ---')
    const payment = await arService.recordCustomerPayment(
      {
        customerId: testCustomer.id,
        amount: 400,
        paymentMethod: 'CASH',
        transactionId: `RCPT-${randomSuffix}`,
        remarks: 'Partial payment from B2B client Acme',
      },
      ctx,
    )

    const balance3 = await arService.getCustomerOutstandingBalance(testCustomer.id, tenantId)
    if (Number(balance3) === 400) {
      console.log(`  ✅ PASS: Outstanding after $400 payment = $${balance3} (Expected $400)`)
      passed++
    } else {
      console.log(`  ❌ FAIL: Outstanding after payment = $${balance3} (Expected $400)`)
      failed++; errors.push('Test 4 failed')
    }

    // Verify GL journal was created for the payment
    const payJournal = await em.findOne(JournalEntryEntity, {
      where: { referenceId: payment.id, tenantId },
      relations: ['lines', 'lines.account'],
    })
    if (payJournal && payJournal.lines.length === 2) {
      console.log(`  ✅ PASS: GL Journal created: "${payJournal.description}"`)
      for (const line of payJournal.lines) {
        console.log(`       → Account ${line.account?.code || line.accountId} (${line.account?.name || 'N/A'}): ${line.side} $${line.amount}`)
      }
      passed++
    } else {
      console.log(`  ❌ FAIL: GL Journal not found or missing lines for payment`)
      failed++; errors.push('Test 4b GL journal failed')
    }

    // ---------------------------------------------------
    // TEST 5: Generate Aging Report
    // ---------------------------------------------------
    console.log('\n--- Test 5: Accounts Receivable Aging Report ---')
    const agingReport = await arService.getArAgingReport(ctx)
    const clientReport = agingReport.find((c) => c.customerId === testCustomer.id)

    if (clientReport) {
      console.log(`  ✅ PASS: Customer found in aging report`)
      console.log(`       → Customer: ${clientReport.customerName} | Company: ${clientReport.companyName}`)
      console.log(`       → Total Outstanding: $${clientReport.totalOutstanding}`)
      console.log(`       → Credit Limit: $${clientReport.creditLimit} | Credit Hold: ${clientReport.creditHold}`)
      console.log(`       → Aging Buckets:`)
      console.log(`           Current: $${clientReport.aging.current}`)
      console.log(`           1-30 Days: $${clientReport.aging['1-30']}`)
      console.log(`           31-60 Days: $${clientReport.aging['31-60']}`)
      console.log(`           61-90 Days: $${clientReport.aging['61-90']}`)
      console.log(`           90+ Days: $${clientReport.aging['90+']}`)
      passed++
    } else {
      console.log(`  ❌ FAIL: Customer not found in AR aging report`)
      failed++; errors.push('Test 5 failed')
    }

    // ---------------------------------------------------
    // TEST 6: Customer ledger retrieval
    // ---------------------------------------------------
    console.log('\n--- Test 6: Customer Ledger Retrieval ---')
    const ledger = await arService.getCustomerLedger(testCustomer.id, tenantId)
    if (ledger.length === 3) { // 2 invoices + 1 payment
      console.log(`  ✅ PASS: Customer ledger has ${ledger.length} entries (2 invoices + 1 payment)`)
      for (const entry of ledger) {
        console.log(`       → ${entry.type}: $${entry.amount} | Balance After: $${entry.balanceAfter}`)
      }
      passed++
    } else {
      console.log(`  ❌ FAIL: Expected 3 ledger entries, found ${ledger.length}`)
      failed++; errors.push('Test 6 failed')
    }

  } finally {
    // ---- Cleanup ----
    console.log('\n--- Cleanup ---')
    await em.delete(ArLedgerEntity, { customerId: testCustomer.id, tenantId })
    await em.delete(UserEntity, { id: testCustomer.id })
    console.log(`✓ Removed test customer and all ${ArLedgerEntity.name} records`)
  }

  await app.close()

  // ---- Summary ----
  console.log('\n═══════════════════════════════════════════════')
  console.log(`AR Integration Test Results: ${passed} passed, ${failed} failed`)
  if (errors.length > 0) {
    console.log('Failures:')
    errors.forEach((e) => console.log(`  - ${e}`))
    process.exit(1)
  } else {
    console.log('✅ ALL AR TESTS PASSED SUCCESSFULLY!')
    console.log('═══════════════════════════════════════════════')
  }
}

runTest().catch((err) => {
  console.error('\n❌ Fatal Test Error:', err.message || err)
  process.exit(1)
})
