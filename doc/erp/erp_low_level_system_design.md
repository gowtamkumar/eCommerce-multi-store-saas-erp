# ERP Low-Level System Design (LLD)

**Document Version:** 1.0.0  
**Prepared By:** Senior Systems Architect & Principal Engineer  
**Date:** May 24, 2026  
**Scope:** Internal service contracts, guard chains, event routing, database transaction patterns, BullMQ job schemas, and TypeORM migration rules.

---

## 1. Request Processing Pipeline (Guard Chain)

Every HTTP request passes through a deterministic guard chain before touching any service method. Understanding this pipeline is mandatory for all engineers modifying controller-level behavior.

```
                     HTTP Request Arrives
                            │
                  ┌─────────▼─────────┐
                  │  TenantMiddleware  │  (Express Middleware)
                  │  ─────────────── │  - Reads Host header
                  │  Resolve tenant   │  - Queries tenants table (Redis cached)
                  │  from subdomain   │  - Sets req.tenantId
                  │  or custom domain │  - If not found → 404 Not Found
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │  JwtAuthGuard     │  (NestJS Guard, order: 1)
                  │  ─────────────── │  - Reads Authorization: Bearer <token>
                  │  Validate JWT     │  - Validates signature & expiry
                  │  Load user from   │  - Loads user from DB (Redis cached)
                  │  token payload    │  - Sets req.user, req.userId
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │ SubscriptionGuard │  (NestJS Guard, order: 2)
                  │  ─────────────── │  - Reads @RequireFeature() decorator
                  │  Check tenant     │  - Looks up tenant_features table
                  │  plan feature     │  - Falls back to plan.features JSONB
                  │  entitlements     │  - If missing: 403 Upgrade Required
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │  PermissionsGuard │  (NestJS Guard, order: 3)
                  │  ─────────────── │  - Reads @RequirePermission() decorator
                  │  Check RBAC       │  - Loads user.roleEntity.permissions
                  │  permission code  │  - Checks ALLOW/DENY on permission code
                  │                   │  - If missing: 403 Forbidden
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │  BranchScope /    │  (NestJS Guard, order: 4 — optional)
                  │  WarehouseScope   │  - Checks user.branchId vs requested resource
                  │  ─────────────── │  - If user.branchScope ≠ ALL and branch
                  │  Scope-limit data │    mismatch → 403 Outside Scope
                  │  to org boundary  │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Controller      │
                  │   Method          │  - Extracts @GetContext() → RequestContextDto
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Service Layer   │  - Business logic, domain validations
                  │                   │  - Calls Repository or emits Events
                  └───────────────────┘
```

---

## 2. RequestContextDto — The Context Contract

Every service method signature receives a `RequestContextDto` as its first argument. This is the **single source of trust** for all tenant-scoped operations.

```typescript
// server/src/common/dto/request-context.dto.ts
export class RequestContextDto {
  tenantId: string           // The resolved tenant UUID (never comes from request body)
  userId: string             // Authenticated user's UUID
  userRole: UserRole         // Enum: SUPER_ADMIN | ADMIN | MANAGER | STAFF | USER
  branchId?: string          // User's assigned branch (nullable for tenant-level users)
  warehouseId?: string       // User's assigned warehouse (nullable)
  branchScope: string[]      // ['ALL'] or [uuid, uuid, ...] — branches user can access
  warehouseScope: string[]   // ['ALL'] or [uuid, ...] — warehouses user can access
}
```

**Rules:**
- `tenantId` is **injected by the middleware**, never from `req.body` or `req.params`
- Services must pass `ctx` to every repository call
- Event payloads must always carry `tenantId` from `ctx`

---

## 3. BullMQ Job Schema Contracts

All background jobs must conform to strict typed schemas. This prevents runtime failures in queue processors.

### 3.1 Stock Ledger Update Job
**Queue:** `product-queue`  
**Job Name:** `update-stock`

```typescript
interface StockUpdateJobPayload {
  tenantId: string            // REQUIRED — tenant isolation
  warehouseId: string         // REQUIRED — which warehouse changes
  variantId: string           // REQUIRED — which product variant
  quantity: number            // REQUIRED — positive (IN) or negative (OUT)
  referenceType: 'ORDER' | 'GRN' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN'
  referenceId: string         // UUID of the triggering document
  unitCost?: number           // Optional — for FIFO cost tracking on GRN
  batchLotId?: string         // Optional — if batch tracking enabled
}

// Job Options — always include idempotency key
const jobId = `stock:${referenceType}:${referenceId}:${variantId}`
await productQueue.add('update-stock', payload, { jobId })
```

### 3.2 Journal Entry Posting Job
**Queue:** `accounting-queue`  
**Job Name:** `post-journal`

```typescript
interface PostJournalJobPayload {
  tenantId: string
  referenceType: 'ORDER' | 'GRN' | 'PAYROLL' | 'EXPENSE' | 'SUPPLIER_PAYMENT' | 'MANUAL'
  referenceId: string
  description: string
  entryDate: string           // ISO date string 'YYYY-MM-DD'
  lines: Array<{
    accountCode: string       // e.g., '1000', '4000'
    type: 'DEBIT' | 'CREDIT'
    amount: number
    branchId?: string         // Optional dimension tag
  }>
}

// Validation gate — reject if unbalanced
const debitTotal = lines.filter(l => l.type === 'DEBIT').reduce((s, l) => s + l.amount, 0)
const creditTotal = lines.filter(l => l.type === 'CREDIT').reduce((s, l) => s + l.amount, 0)
if (Math.abs(debitTotal - creditTotal) > 0.001) {
  throw new Error(`Journal unbalanced: DR=${debitTotal} CR=${creditTotal}`)
}
```

### 3.3 Email Dispatch Job
**Queue:** `email-queue`  
**Job Name:** `send-email`

```typescript
interface SendEmailJobPayload {
  tenantId: string
  to: string[]
  subject: string
  templateId: string          // 'order-confirmation' | 'payslip' | 'leave-approved'
  data: Record<string, unknown>
  attachmentUrls?: string[]   // S3 pre-signed URLs
}
```

---

## 4. Event-Driven Accounting: The Outbox Pattern

The accounting module listens to domain events emitted by business operations. This is how the system avoids tight coupling between the Sales or HRM modules and the Finance module.

### 4.1 Event Emission (Sales Module)
```typescript
// In OrderService.completeOrder()
await this.eventEmitter.emit('order.paid', {
  tenantId: ctx.tenantId,
  orderId: order.id,
  branchId: order.branchId,
  totalRevenue: order.total,
  totalCost: order.cogsCost,
  paymentMethod: order.paymentMethod,
})
```

### 4.2 Accounting Listener (Finance Module)
```typescript
// In AccountingEventListener
@OnEvent('order.paid')
async handleOrderPaid(event: OrderPaidEvent): Promise<void> {
  const revenueAccountCode = '4000'
  const cashAccountCode = event.paymentMethod === 'ACCOUNT' ? '1200' : '1000'
  const cogsAccountCode = '5000'
  const inventoryAccountCode = '1100'

  await this.accountingQueue.add('post-journal', {
    tenantId: event.tenantId,
    referenceType: 'ORDER',
    referenceId: event.orderId,
    description: `Sale revenue — Order #${event.orderId.slice(0, 8)}`,
    entryDate: new Date().toISOString().split('T')[0],
    lines: [
      { accountCode: cashAccountCode,     type: 'DEBIT',  amount: event.totalRevenue },
      { accountCode: revenueAccountCode,  type: 'CREDIT', amount: event.totalRevenue },
      { accountCode: cogsAccountCode,     type: 'DEBIT',  amount: event.totalCost },
      { accountCode: inventoryAccountCode,type: 'CREDIT', amount: event.totalCost },
    ],
  }, {
    jobId: `journal:order:${event.orderId}`,  // Idempotent — safe to retry
  })
}
```

### 4.3 Complete Domain Event Registry

| Event Name | Emitted By | Accounting Effect |
| :--- | :--- | :--- |
| `order.paid` | Sales / POS | DR Cash or AR / CR Revenue + DR COGS / CR Inventory |
| `grn.verified` | Logistics | DR Inventory Asset / CR Accounts Payable |
| `supplier.payment.released` | Procurement | DR Accounts Payable / CR Cash at Bank |
| `payroll.batch.approved` | HRM | DR Salary Expense / CR Salary Payable |
| `payroll.payment.released` | HRM | DR Salary Payable / CR Cash at Bank |
| `expense.created` | Finance | DR Expense Account / CR Cash |
| `order.returned` | Sales | DR Revenue / CR Cash + DR Inventory / CR COGS |
| `wallet.credited` | CRM | DR Revenue / CR Store Credit Liability |
| `wallet.redeemed` | Sales | DR Store Credit Liability / CR Revenue |

---

## 5. Database Transaction Boundary Patterns

### 5.1 Single-Domain Transaction (Standard)
Used when a single service writes to tables within its own domain:

```typescript
// Simple — use TypeORM's DataSource.transaction()
await this.dataSource.transaction(async (manager) => {
  const order = await manager.save(OrderEntity, orderData)
  await manager.save(OrderItemEntity, itemsData)
  // If any line fails, the entire transaction rolls back
})
```

### 5.2 Cross-Domain Transaction (Stock + Finance)
When a business operation must atomically write to multiple domains (e.g., POS sale that creates both a stock movement and a shift total update):

```typescript
// Use QueryRunner for explicit transaction lifecycle control
const queryRunner = this.dataSource.createQueryRunner()
await queryRunner.connect()
await queryRunner.startTransaction()

try {
  // Domain 1: Commit the sale
  const sale = await queryRunner.manager.save(PosOrderEntity, saleData)

  // Domain 2: Update shift totals
  await queryRunner.manager.increment(PosShiftEntity, { id: shiftId }, 'totalSales', sale.total)

  // Commit the DB transaction first — money is safe
  await queryRunner.commitTransaction()

  // THEN emit async event for accounting (outside transaction — eventual consistency)
  this.eventEmitter.emit('order.paid', { tenantId: ctx.tenantId, orderId: sale.id, ... })

} catch (error) {
  await queryRunner.rollbackTransaction()
  throw error
} finally {
  await queryRunner.release()
}
```

**Key Rule:** Always emit events **after** the DB transaction commits. Emitting inside the transaction means the listener might query uncommitted data.

---

## 6. TypeORM Migration Rules & Safety

All schema changes must go through TypeORM migrations. Raw `ALTER TABLE` or `CREATE TABLE` in production are prohibited.

### 6.1 Generating a New Migration
```bash
# In the server/ directory:
npm run typeorm migration:generate -- -n AddFixedAssetTable

# This creates: server/src/database/migrations/{timestamp}-AddFixedAssetTable.ts
```

### 6.2 Critical Migration Safety Rules

**Rule 1 — Never use `ALTER COLUMN` to change a type on a column with data:**
```typescript
// ❌ UNSAFE — will fail on large tables with existing data
async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.changeColumn('products', 'price', new TableColumn({ type: 'bigint' }))
}

// ✅ SAFE — add new column, backfill, then drop old column in 3 separate deploys
async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.addColumn('products', new TableColumn({ name: 'price_bigint', type: 'bigint', isNullable: true }))
}
```

**Rule 2 — Never `DROP COLUMN` without first checking usage in application code:**
```typescript
// Audit grep before any drop migration:
// $ grep -r "columnName" server/src --include="*.ts"
```

**Rule 3 — Always create indexes in separate migrations from table creation:**
Large tables lock during index creation. Create the index `CONCURRENTLY` to avoid write-blocking:
```typescript
// Use raw SQL for CONCURRENTLY — TypeORM doesn't support it natively
await queryRunner.query(`
  CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_inventory_tenant_variant_wh"
  ON "inventory_transactions"("tenant_id", "variant_id", "warehouse_id")
`)
```

**Rule 4 — Every migration must have a working `down()` method:**
```typescript
async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropTable('fixed_assets', true)
}
```

---

## 7. Redis Cache Invalidation Contracts

Cache entries must be invalidated deterministically when underlying data changes.

### 7.1 Cache Key Naming Convention

| Pattern | Example Key | TTL |
| :--- | :--- | :--- |
| `t:{tenantId}:settings` | `t:abc-123:settings` | 3600s (1 hour) |
| `t:{tenantId}:plan` | `t:abc-123:plan` | 3600s |
| `t:{tenantId}:reports:pl:{from}:{to}` | `t:abc-123:reports:pl:2026-01-01:2026-01-31` | 600s |
| `t:{tenantId}:stock:{warehouseId}:{variantId}` | `t:abc-123:stock:wh-01:var-55` | 120s |
| `tenant:resolve:{hostname}` | `tenant:resolve:shop.abc.com` | 86400s (24hr) |

### 7.2 Invalidation Triggers

| Event | Cache Keys to Invalidate |
| :--- | :--- |
| Site settings saved | `t:{tenantId}:settings` |
| Subscription plan changed | `t:{tenantId}:plan`, `tenant:resolve:{hostname}` |
| Stock movement posted | `t:{tenantId}:stock:{warehouseId}:{variantId}` |
| Report generated | Do NOT cache on mutation — only cache `GET` report endpoints |

```typescript
// Cache invalidation helper
async invalidateTenantCache(tenantId: string, ...keys: string[]): Promise<void> {
  const prefixedKeys = keys.map(k => `t:${tenantId}:${k}`)
  await this.cacheManager.del(...prefixedKeys)
}
```
