# ERP Low-Level System Design (LLD)

**Document Version:** 2.0.0
**Status:** Approved for Engineering
**Last Updated:** May 24, 2026
**Scope:** Internal service contracts, guard chains, event routing, transaction patterns, BullMQ contracts, cache invalidation, **and a module-by-module low-level design that maps 1:1 to the codebase under `server/src/modules/`.**

> This document is the engineer's reference. For the system-wide architecture and principles, see [`erp_master_system_design.md`](erp_master_system_design.md). For the database schemas and ERD, see [`erp_master_database_design.md`](erp_master_database_design.md).

---

## Table of Contents

**Part I — Cross-Cutting Foundations**
1. [Request Processing Pipeline (Guard Chain)](#1-request-processing-pipeline-guard-chain)
2. [`RequestContextDto` — The Context Contract](#2-requestcontextdto--the-context-contract)
3. [BullMQ Job Schema Contracts](#3-bullmq-job-schema-contracts)
4. [Event-Driven Architecture & Outbox Pattern](#4-event-driven-architecture--outbox-pattern)
5. [Database Transaction Boundary Patterns](#5-database-transaction-boundary-patterns)
6. [TypeORM Migration Safety Rules](#6-typeorm-migration-safety-rules)
7. [Redis Cache Invalidation Contracts](#7-redis-cache-invalidation-contracts)
8. [Idempotency Contracts](#8-idempotency-contracts)
9. [Locking Strategy & Lock Order](#9-locking-strategy--lock-order)
10. [Standard Error Codes & Response Envelopes](#10-standard-error-codes--response-envelopes)

**Part II — Module-by-Module Low-Level Design**

11. [Module Catalog (Index)](#11-module-catalog-index)
12. [System: Tenant](#12-system-tenant)
13. [System: Subscription (Plan + Billing)](#13-system-subscription-plan--billing)
14. [System: Organization (Company / Branch / Warehouse)](#14-system-organization-company--branch--warehouse)
15. [System: Audit Log](#15-system-audit-log)
16. [System: Super-Admin & Platform](#16-system-super-admin--platform)
17. [Identity: Auth (JWT, Session, Admin Auth)](#17-identity-auth-jwt-session-admin-auth)
18. [Identity: User / Role / Permission / RBAC](#18-identity-user--role--permission--rbac)
19. [Catalog: Product / Variant / Attribute](#19-catalog-product--variant--attribute)
20. [Catalog: Brand & Category](#20-catalog-brand--category)
21. [Catalog: Pricing](#21-catalog-pricing)
22. [Catalog: Review](#22-catalog-review)
23. [Sales: Order & Return](#23-sales-order--return)
24. [Sales: Cart](#24-sales-cart)
25. [Sales: Coupon](#25-sales-coupon)
26. [Sales: Promotion](#26-sales-promotion)
27. [Sales: Payment](#27-sales-payment)
28. [Sales: POS (Register · Shift · Drawer)](#28-sales-pos-register--shift--drawer)
29. [Inventory: Ledger / Reservation / Transfer / Batch](#29-inventory-ledger--reservation--transfer--batch)
30. [Procurement: PR / RFQ / PO / Supplier Invoice / Debit Note](#30-procurement-pr--rfq--po--supplier-invoice--debit-note)
31. [Procurement: Supplier (master + AP ledger + portal)](#31-procurement-supplier-master--ap-ledger--portal)
32. [Logistics: GRN](#32-logistics-grn)
33. [Logistics: Fulfillment](#33-logistics-fulfillment)
34. [Logistics: Courier (Pathao / Steadfast / Webhooks)](#34-logistics-courier-pathao--steadfast--webhooks)
35. [Finance: Accounting (Journal · AR · Wallet · Tax · Dunning · Reports · COGS)](#35-finance-accounting-journal--ar--wallet--tax--dunning--reports--cogs)
36. [Finance: Expense](#36-finance-expense)
37. [Finance: Invoice (sales invoices)](#37-finance-invoice-sales-invoices)
38. [Finance: Report](#38-finance-report)
39. [CRM: Customer / Subscriber](#39-crm-customer--subscriber)
40. [CRM: Lead](#40-crm-lead)
41. [Marketing: Campaign](#41-marketing-campaign)
42. [Marketing: Loyalty / Referral](#42-marketing-loyalty--referral)
43. [Content: Page / FAQ / Site Settings](#43-content-page--faq--site-settings)
44. [HRM (Employee · Attendance · Leave · Payroll · Recruitment)](#44-hrm-employee--attendance--leave--payroll--recruitment)
45. [Store: Cart / Wishlist / Wallet / Shipping Address](#45-store-cart--wishlist--wallet--shipping-address)
46. [Infra: Cache / Queue / File / Mail / Notification / Chat / Push / SMS](#46-infra-cache--queue--file--mail--notification--chat--push--sms)

**Part III — Acceptance for any new LLD entry**
47. [Author's Checklist for LLD Updates](#47-authors-checklist-for-lld-updates)

---

# Part I — Cross-Cutting Foundations

## 1. Request Processing Pipeline (Guard Chain)

Every HTTP request passes through a deterministic guard chain before touching any service method. Understanding this pipeline is mandatory for all engineers modifying controller-level behavior.

```
                     HTTP Request Arrives
                            │
                  ┌─────────▼─────────┐
                  │ TenantMiddleware  │  (Express Middleware)
                  │  ─────────────────│  - Reads Host header
                  │  Resolve tenant   │  - Queries tenants (Redis cached)
                  │  from subdomain   │  - Sets req.tenantId
                  │  or custom domain │  - Not found → 404
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │  JwtAuthGuard     │  (NestJS Guard, order: 1)
                  │  ─────────────────│  - Reads Authorization: Bearer <token>
                  │  Validate JWT     │  - Validates signature & expiry
                  │  Load user        │  - Loads user (Redis cached)
                  │  from token       │  - Sets req.user, req.userId
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │ SubscriptionGuard │  (NestJS Guard, order: 2)
                  │  ─────────────────│  - Reads @RequireFeature() decorator
                  │  Plan feature     │  - Fallback to plan.features JSONB
                  │  entitlement      │  - Missing → 403 FEATURE_NOT_ENABLED
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │ PermissionsGuard  │  (NestJS Guard, order: 3)
                  │  ─────────────────│  - Reads @RequirePermission() decorator
                  │  RBAC check       │  - Loads roles.permissions + user overrides
                  │                   │  - DENY override > ALLOW override > role grant
                  │                   │  - Missing → 403 PERMISSION_DENIED
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │ BranchScope /     │  (NestJS Guard, order: 4 — optional)
                  │ WarehouseScope    │  - branchScope = ['ALL'] short-circuits
                  │  ─────────────────│  - Otherwise resource.branchId ∈ scope
                  │                   │  - Mismatch → 403 SCOPE_DENIED
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Controller      │
                  │   Method          │  - @GetContext() → RequestContextDto
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Service Layer   │  - Business rules + invariants
                  │                   │  - Calls Repositories or emits Events
                  └───────────────────┘
```

---

## 2. `RequestContextDto` — The Context Contract

Every service method that performs tenant-scoped work receives `RequestContextDto` as its first argument. This is the **single source of trust**.

```typescript
// server/src/common/dto/request-context.dto.ts
export class RequestContextDto {
  tenantId: string           // Resolved tenant UUID (never from request body)
  userId: string             // Authenticated user UUID
  userRole: UserRole         // SUPER_ADMIN | ADMIN | MANAGER | STAFF | USER
  branchId?: string          // User's primary branch (nullable for tenant-level)
  warehouseId?: string       // User's primary warehouse (nullable)
  branchScope: string[]      // ['ALL'] or [uuid, ...] — branches the user can act on
  warehouseScope: string[]   // ['ALL'] or [uuid, ...] — warehouses the user can act on
}
```

**Service-layer rules:**
- `tenantId` is **injected by middleware**, never trusted from `req.body` or `req.params`.
- Services must pass `ctx` to every repository call. Repositories filter `WHERE tenantId = :tenantId` unconditionally.
- Event payloads must always carry `tenantId` from `ctx`.
- Cross-module service-to-service calls forward the `ctx` unchanged. The receiving service does not look up `tenantId` again.
- Queue jobs serialize the minimal subset of `ctx` (typically `tenantId` + `userId`) into their payload.

---

## 3. BullMQ Job Schema Contracts

All background jobs must conform to strict typed schemas. Workers reject malformed payloads.

### 3.1 Stock Ledger Update Job

**Queue:** `product-queue` · **Job Name:** `update-stock`

```typescript
interface StockUpdateJobPayload {
  tenantId: string             // REQUIRED
  warehouseId: string          // REQUIRED
  variantId: string            // REQUIRED
  quantity: number             // positive = IN, negative = OUT
  referenceType: 'ORDER' | 'GRN' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN'
  referenceId: string
  unitCost?: number            // for FIFO/cost layering on GRN
  batchLotId?: string          // if batch-tracked
}

// Idempotent job id
const jobId = `stock:${referenceType}:${referenceId}:${variantId}`
await productQueue.add('update-stock', payload, { jobId })
```

### 3.2 Journal Entry Posting Job

**Queue:** `accounting-queue` · **Job Name:** `post-journal`

```typescript
interface PostJournalJobPayload {
  tenantId: string
  referenceType: 'ORDER' | 'GRN' | 'PAYROLL' | 'EXPENSE' | 'SUPPLIER_PAYMENT' | 'MANUAL' | 'RETURN' | 'WALLET' | 'ADJUSTMENT'
  referenceId: string
  description: string
  entryDate: string            // ISO 'YYYY-MM-DD'
  lines: Array<{
    accountCode: string        // e.g. '1000', '4000'
    type: 'DEBIT' | 'CREDIT'
    amount: number
    branchId?: string          // dimension tag
    currency?: string          // 3-letter ISO
    fxRate?: number            // if currency ≠ tenant base
  }>
}

// Validation: reject if unbalanced
const dr = lines.filter(l => l.type === 'DEBIT').reduce((s, l) => s + l.amount, 0)
const cr = lines.filter(l => l.type === 'CREDIT').reduce((s, l) => s + l.amount, 0)
if (Math.abs(dr - cr) > 0.001) throw new JournalUnbalancedError(dr, cr)
```

### 3.3 Email / Notification Dispatch Job

**Queue:** `email-queue` · **Job Name:** `send-email`

```typescript
interface SendEmailJobPayload {
  tenantId: string
  to: string[]
  subject: string
  templateId: string           // 'order-confirmation' | 'payslip' | 'leave-approved' | ...
  data: Record<string, unknown>
  attachmentUrls?: string[]    // S3 pre-signed URLs
}
```

### 3.4 Other production queues (referenced)

| Queue | Purpose | Key job names |
| --- | --- | --- |
| `order-queue` | post-commit side effects for orders | `process-order`, `generate-invoice-pdf` |
| `campaign-queue` | campaign delivery | `dispatch-campaign`, `evaluate-segment` |
| `loyalty-queue` | loyalty point grants/expiry | `accrue-points`, `expire-points` |
| `report-queue` | heavy report generation | `build-pl`, `build-bs`, `build-cash-flow` |
| `courier-queue` | external courier API calls | `create-shipment`, `poll-status` |

All workers run in a separate Node process pointing at the same code. Workers MUST register a `failed` handler that writes to `accounting_outbox` (if accounting-related) or `audit_logs` (otherwise).

---

## 4. Event-Driven Architecture & Outbox Pattern

### 4.1 Two event channels

| Channel | Used for | Delivery |
| --- | --- | --- |
| **NestJS EventEmitter2** (`@OnEvent`) | In-process side effects with no durability requirement (cache invalidation, websocket pushes) | At-most-once, synchronous |
| **Transactional Outbox + BullMQ** | Source-of-truth side effects (journals, stock, notifications, courier) | At-least-once, durable, retriable |

### 4.2 Outbox table

```sql
CREATE TABLE outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',     -- PENDING | DISPATCHING | DISPATCHED | FAILED
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_outbox_pending ON outbox (status, next_attempt_at) WHERE status = 'PENDING';
```

Finance has its own specialized outbox table `accounting_outbox` (already in code: `accounting-outbox.entity.ts`) which the dispatcher polls every N seconds and turns into `post-journal` BullMQ jobs.

### 4.3 Standard event payload shape

```typescript
interface DomainEvent<T = unknown> {
  tenantId: string             // REQUIRED — always present
  eventType: string            // 'order.paid' | 'grn.verified' | ...
  aggregateType: string        // 'Order' | 'Grn' | ...
  aggregateId: string          // primary id of the aggregate
  occurredAt: string           // ISO timestamp
  actorUserId?: string         // who triggered it
  payload: T
}
```

### 4.4 Canonical domain event registry

| Event | Emitted by | Accounting effect | Other consumers |
| --- | --- | --- | --- |
| `order.created` | Sales · POS | — | Invoice, notification, reservation-expiry job |
| `order.paid` | Sales · POS · Payment webhook | DR Cash or AR / CR Revenue + DR COGS / CR Inventory | Fulfillment, loyalty, notification |
| `order.shipped` | Fulfillment | (already posted at paid) | Customer notification, courier tracking |
| `order.returned` | Sales | Reverse revenue + restock | Stock, wallet (refund), notification |
| `grn.verified` | Logistics (GRN) | DR Inventory / CR AP | Inventory ledger IN, procurement |
| `supplier.invoice.posted` | Procurement | DR Expense or Inventory / CR AP | Finance AP aging |
| `supplier.payment.released` | Procurement | DR AP / CR Cash at Bank | Notification |
| `expense.created` | Finance Expense | DR Expense / CR Cash | Notification |
| `payroll.batch.approved` | HRM | DR Salary Expense / CR Salary Payable | Notification |
| `payroll.payment.released` | HRM | DR Salary Payable / CR Cash at Bank | Notification, payslip mail |
| `wallet.credited` | CRM | DR Revenue / CR Store-Credit Liability | Notification |
| `wallet.redeemed` | Sales (at order paid) | DR Store-Credit Liability / CR Revenue | — |
| `stock.low` | Inventory | — | Procurement (auto-PR draft), notification |
| `customer.credit.exceeded` | CRM | — | Notification, finance dashboard |
| `tenant.subscription.changed` | System (subscription) | — | Cache invalidation, feature gate refresh |

**Rule:** an event is named in the past tense (`order.paid`, not `order.pay`).

### 4.5 Emit timing

Events MUST be emitted **after the DB transaction commits**. Emitting inside the transaction means listeners can query uncommitted data and produce phantom side effects. Pattern:

```typescript
const result = await this.dataSource.transaction(async (m) => { /* writes + outbox insert */ })
this.eventEmitter.emit('order.paid', { tenantId: ctx.tenantId, orderId: result.id, ... })
return result
```

For durable side effects (journals, stock, notifications), **persist into the outbox inside the transaction** and let the dispatcher pick it up. Do not rely on in-process `EventEmitter` alone for money or stock.

---

## 5. Database Transaction Boundary Patterns

### 5.1 Single-domain transaction (default)

```typescript
await this.dataSource.transaction(async (manager) => {
  const order = await manager.save(OrderEntity, orderData)
  await manager.save(OrderItemEntity, items)
})
```

### 5.2 Cross-domain transaction (`QueryRunner` lifecycle)

When a business operation must atomically touch multiple domains (e.g., POS sale = order + stock + shift + outbox):

```typescript
const qr = this.dataSource.createQueryRunner()
await qr.connect()
await qr.startTransaction()
try {
  const sale = await qr.manager.save(PosOrderEntity, saleData)
  await qr.manager.increment(PosShiftEntity, { id: shiftId }, 'totalSales', sale.total)
  await qr.manager.save(InventoryLedgerEntity, ledgerRow)
  await qr.manager.save(OutboxEntity, { eventType: 'order.paid', payload: ... })
  await qr.commitTransaction()
  this.eventEmitter.emit('order.paid', payload)   // AFTER commit
} catch (e) {
  await qr.rollbackTransaction()
  throw e
} finally {
  await qr.release()
}
```

### 5.3 Workflows that MUST commit atomically

| Workflow | Tables in one txn |
| --- | --- |
| Online order creation | `orders`, `order_items`, `stock_reservations`, `coupon_usages`, `outbox` |
| POS sale sync | `pos_sale_idempotency_keys`, `orders`, `order_items`, `payments`, `inventory_ledger`, `pos_shifts` (totals), `outbox` |
| PO receiving / GRN | `goods_received_notes`, `grn_items`, `inventory_ledger`, `accounting_outbox` |
| Supplier payment | `supplier_payments`, `supplier_ap_ledger`, `accounting_outbox` |
| Customer credit sale | `orders`, `invoices`, `ar_ledger`, `accounting_outbox` |
| Stock adjustment approval | `inventory_adjustment_approvals`, `inventory_ledger`, `accounting_outbox` (if value changes) |
| Payroll approval | `payroll_batches` (status), `payroll_slips`, `accounting_outbox` |
| Stock transfer (close) | `stock_transfers` (status), `stock_transfer_items`, `inventory_ledger` (IN at destination) |

### 5.4 Workflows that MUST run async

| Async task | Why |
| --- | --- |
| Email / SMS / push | User shouldn't wait |
| Search index update | Eventually consistent |
| Dashboard rollups | Acceptable lag |
| PDF generation (invoice, payslip, GRN) | Slow + retriable |
| Export jobs (CSV, Excel) | Large data |
| Courier shipment creation | External dependency |

---

## 6. TypeORM Migration Safety Rules

All schema changes go through TypeORM migrations under `server/src/database/migrations/`. Raw `ALTER TABLE` or `CREATE TABLE` in production is prohibited.

### 6.1 Generating a migration

```bash
# in server/
npm run typeorm migration:generate -- -n AddFixedAssetTable
# emits: server/src/database/migrations/{timestamp}-AddFixedAssetTable.ts
```

### 6.2 Critical rules

| # | Rule | Why |
| --- | --- | --- |
| 1 | Never `ALTER COLUMN` to change type on a populated column in one deploy | Long write lock, irreversible on failure |
| 2 | Never `DROP COLUMN` without first checking usage in app code | Hidden references break runtime |
| 3 | Always create indexes on large tables with `CONCURRENTLY` | Avoids write-blocking |
| 4 | Every migration must have a working `down()` | Rollback safety |
| 5 | Never write to the destination table for backfill in the same migration as schema change | Decouples lock duration from data volume |

```typescript
// ✅ SAFE — add new column, backfill in a separate migration, drop old column in a third
async up(qr: QueryRunner) {
  await qr.addColumn('products', new TableColumn({ name: 'price_bigint', type: 'bigint', isNullable: true }))
}

// ✅ SAFE — index creation
await qr.query(`
  CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_inv_tenant_variant_wh"
  ON "inventory_ledger" ("tenant_id", "variant_id", "warehouse_id")
`)
```

### 6.3 Required code review checks for any migration

- `tenant_id` included on every new business table and indexed first?
- Foreign keys reference the right tenant (multi-tenant FK invariant)?
- All `WHERE` indexes that the new feature relies on are created in the same migration?
- `down()` is implemented and tested locally?
- The migration runs in <30s on a copy of staging?

---

## 7. Redis Cache Invalidation Contracts

### 7.1 Key naming convention

```
t:{tenantId}:{domain}:{resource}:{paramsHash}
```

| Pattern | Example | TTL |
| --- | --- | --- |
| `t:{tenantId}:settings` | `t:abc-123:settings` | 3600s |
| `t:{tenantId}:plan` | `t:abc-123:plan` | 3600s |
| `t:{tenantId}:features` | `t:abc-123:features` | 3600s |
| `t:{tenantId}:stock:{warehouseId}:{variantId}` | `t:abc:stock:wh-1:v-55` | 120s |
| `t:{tenantId}:reports:pl:{from}:{to}` | `t:abc:reports:pl:2026-01-01:2026-01-31` | 600s |
| `t:{tenantId}:product:{slug}` | `t:abc:product:nike-air-max` | 600s |
| `tenant:resolve:{host}` | `tenant:resolve:shop.abc.com` | 86400s |
| `user:{userId}:permissions` | `user:u-7:permissions` | 600s |

Every cache key MUST start with either `t:{tenantId}:` (tenant data) or `tenant:resolve:` / `user:` (platform-level).

### 7.2 Invalidation triggers

| Mutation | Keys to invalidate |
| --- | --- |
| Tenant updated | `tenant:resolve:*` for old + new hostname, `t:{tenantId}:settings` |
| Subscription plan changed | `t:{tenantId}:plan`, `t:{tenantId}:features`, all `user:*:permissions` for that tenant |
| Permission/role updated | `user:*:permissions` for affected users |
| Product saved | `t:{tenantId}:product:{slug}`, search index re-index event |
| Stock movement posted | `t:{tenantId}:stock:{warehouseId}:{variantId}` |
| Settings updated | `t:{tenantId}:settings` |

### 7.3 Helper

```typescript
async invalidateTenantCache(tenantId: string, ...keys: string[]) {
  const full = keys.map(k => `t:${tenantId}:${k}`)
  await this.cacheManager.del(...full)
}
```

---

## 8. Idempotency Contracts

All mutating endpoints exposed to external systems (POS, payment gateways, couriers, mobile apps) MUST accept an `Idempotency-Key` header.

### 8.1 Storage

```sql
CREATE TABLE idempotency_keys (
  tenant_id uuid NOT NULL,
  key text NOT NULL,
  action_type text NOT NULL,
  request_hash text NOT NULL,
  response_status smallint,
  response_body jsonb,
  status text NOT NULL DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS | SUCCEEDED | FAILED
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, key)
);
```

### 8.2 Semantics

- Same `(tenantId, key)` + same body → return the cached response.
- Same key + different body → `409 IDEMPOTENCY_PAYLOAD_MISMATCH`.
- TTL: 24h (configurable), then purgeable.

### 8.3 Specific idempotency keys in the system

| Operation | Key |
| --- | --- |
| POS sale sync | `(tenantId, clientSaleId)` (DB unique index, not header-based) |
| Payment webhook | gateway transaction id (header or body) |
| Courier webhook | `couriername:waybillId:eventType:eventTimestamp` |
| Stock ledger BullMQ job | `stock:{referenceType}:{referenceId}:{variantId}` |
| Accounting BullMQ job | `journal:{referenceType}:{referenceId}` |

---

## 9. Locking Strategy & Lock Order

### 9.1 Lock matrix

| Resource | Lock type | Where applied |
| --- | --- | --- |
| Product/variant availability | Pessimistic write OR PG advisory lock | `StockReservationService.reserve()` |
| Customer AR balance | Pessimistic write | `ArService.applyTransaction()` |
| Supplier AP balance | Pessimistic write | `SupplierApLedgerRepository.append()` |
| POS shift totals | Pessimistic write on `pos_shifts` row | `PosService.recordSale()` |
| Journal account running balance | Pessimistic write on `accounts` row | `AccountingService.postJournal()` |
| Tenant entitlement counters (active users, branches) | Checks active subscription limits | `SubscriptionBillingService.checkCap()` |

### 9.2 Advisory lock key format

```
tenant:{tenantId}:stock:{warehouseId}:{variantId}
tenant:{tenantId}:ar:{customerId}
tenant:{tenantId}:ap:{supplierId}
tenant:{tenantId}:shift:{shiftId}
tenant:{tenantId}:account:{accountId}
```

### 9.3 Mandatory lock acquisition order (deadlock-free)

When a single transaction needs multiple locks, acquire them in this fixed order:

1. Tenant / subscription / account.
2. Customer / supplier.
3. Product / variant.
4. Warehouse / bin.
5. Journal account.
6. Shift / register.

Transactions that violate this order are deadlock-prone and must be refactored.

### 9.4 Retry policy

Wrap deadlock-safe transactions with a jittered retry (max 3 attempts):

```typescript
await this.txRunner.withDeadlockRetry({ maxAttempts: 3, baseDelayMs: 50 }, async () => { ... })
```

---

## 10. Standard Error Codes & Response Envelopes

### 10.1 Response envelope

Success:
```json
{ "success": true, "statusCode": 200, "message": "...", "data": {...}, "meta": { "requestId": "uuid", "tenantId": "uuid" } }
```

Error:
```json
{ "success": false, "statusCode": 400, "message": "Validation failed", "error": { "code": "STOCK_INSUFFICIENT", "details": {...} }, "meta": { "requestId": "uuid" } }
```

### 10.2 Canonical error codes

| Code | HTTP | Meaning |
| --- | ---: | --- |
| `TENANT_NOT_FOUND` | 404 | Tenant could not be resolved from host |
| `TENANT_SUSPENDED` | 403 | Tenant subscription is suspended |
| `AUTH_INVALID` | 401 | JWT invalid or expired |
| `FEATURE_NOT_ENABLED` | 403 | Subscription plan doesn't include the feature |
| `PERMISSION_DENIED` | 403 | RBAC denies the action |
| `SCOPE_DENIED` | 403 | Branch/warehouse scope denies the action |
| `VALIDATION_FAILED` | 400 | DTO validation failure (Zod / class-validator) |
| `STOCK_INSUFFICIENT` | 409 | Not enough available stock |
| `STOCK_NEGATIVE_FORBIDDEN` | 409 | Would push on-hand below zero |
| `CREDIT_LIMIT_EXCEEDED` | 409 | Customer over credit limit |
| `SHIFT_CLOSED` | 409 | POS shift is closed |
| `ONE_OPEN_SHIFT_ONLY` | 409 | User already has an open shift |
| `DUPLICATE_IDEMPOTENCY_KEY` | 409 | Same key, different result already cached |
| `IDEMPOTENCY_PAYLOAD_MISMATCH` | 409 | Same key, different payload |
| `JOURNAL_UNBALANCED` | 422 | DR ≠ CR |
| `FISCAL_PERIOD_CLOSED` | 422 | Posting date locked |
| `THREE_WAY_MATCH_FAILED` | 422 | PO/GRN/Invoice mismatch |
| `RESOURCE_NOT_FOUND` | 404 | Entity not found within tenant scope |
| `RESERVATION_EXPIRED` | 409 | Stock reservation TTL elapsed |
| `RETURN_WINDOW_EXPIRED` | 422 | Past the return window |
| `COURIER_UNAVAILABLE` | 503 | External courier API failure |

Services throw typed exceptions (`StockInsufficientException`, `JournalUnbalancedException`, etc.) and the global `HttpExceptionFilter` maps them to this envelope.

---

# Part II — Module-by-Module Low-Level Design

## 11. Module Catalog (Index)

> Each module section below uses a **uniform 9-block template** so engineers can find what they need fast:
> 1. Purpose & boundary  2. Source layout  3. Entities owned  4. Controllers & routes  5. Public services  6. Key DTOs  7. Events emitted / consumed  8. Transactions, locks, idempotency  9. Subscription gate, permissions, error codes

| # | Module | Source path |
| --- | --- | --- |
| 12 | Tenant | `modules/system/tenant` |
| 13 | Subscription (Plan + Billing) | `modules/system/{subscription-plan,subscription-billing}` |
| 14 | Organization | `modules/system/organization` |
| 15 | Audit Log | `modules/system/audit-log` |
| 16 | Super-Admin & Platform | `modules/system/{super-admin,platform}` |
| 17 | Auth | `modules/admin/core/auth` |
| 18 | User / Role / Permission / RBAC | `modules/admin/core/{user,rbac}` |
| 19 | Product / Variant / Attribute | `modules/admin/catalog/product` |
| 20 | Brand & Category | `modules/admin/catalog/{brand,category}` |
| 21 | Pricing | `modules/admin/catalog/pricing` |
| 22 | Review | `modules/admin/catalog/review` |
| 23 | Order & Return | `modules/admin/sales/order` |
| 24 | Cart | `modules/admin/sales/cart` |
| 25 | Coupon | `modules/admin/sales/coupon` |
| 26 | Promotion | `modules/admin/sales/promotion` |
| 27 | Payment | `modules/admin/sales/payment` |
| 28 | POS | `modules/admin/sales/pos` |
| 29 | Inventory | `modules/admin/operations/logistics/inventory-transaction` |
| 30 | Procurement (PR/RFQ/PO/Invoice) | `modules/admin/operations/finance/purchase` |
| 31 | Supplier | `modules/admin/operations/finance/supplier` |
| 32 | GRN | `modules/admin/operations/logistics/grn` |
| 33 | Fulfillment | `modules/admin/operations/logistics/fulfillment` |
| 34 | Courier | `modules/admin/operations/logistics/courier` |
| 35 | Accounting | `modules/admin/operations/finance/accounting` |
| 36 | Expense | `modules/admin/operations/finance/expense` |
| 37 | Invoice | `modules/admin/operations/finance/invoice` |
| 38 | Finance Report | `modules/admin/operations/finance/report` |
| 39 | Customer / Subscriber | `modules/admin/customer/{customer,subscriber}` |
| 40 | Lead | `modules/admin/customer/lead` |
| 41 | Campaign | `modules/admin/marketing/campaign` |
| 42 | Loyalty | `modules/admin/marketing/loyalty` |
| 43 | Page / FAQ / Settings | `modules/admin/content`, `modules/admin/settings` |
| 44 | HRM | `modules/admin/operations/hrm` |
| 45 | Store Public | `modules/store/*` |
| 46 | Infra Services | `modules/admin/operations/infra/*` |

---

## 12. System: Tenant

### 12.1 Purpose & boundary
Authoritative owner of the `tenants` aggregate: identity, subdomain, custom domain, plan link, status. Resolved by `TenantMiddleware` from host header on every request.

### 12.2 Source layout
```
modules/system/tenant/
├─ entities/                       (tenant.entity.ts)
├─ dto/
├─ tenant.repository.ts
├─ tenant.service.ts
├─ tenant.controller.ts            (super-admin scope)
├─ public-tenant.controller.ts     (public lookups, e.g. domain status)
└─ tenant.module.ts
```

### 12.3 Entities owned
- `tenants` — `id`, `name`, `subdomain` (unique), `custom_domain` (unique nullable), `custom_domain_status`, `plan_id` (FK), `status` (ACTIVE | SUSPENDED | TRIAL | CANCELED), audit cols.

### 12.4 Controllers & routes
- `tenant.controller.ts` — mounted under super-admin scope: CRUD tenants, suspend/reactivate, switch plan, set/verify custom domain.
- `public-tenant.controller.ts` — read-only lookup of tenant by host (used by the resolver middleware on cache miss).

### 12.5 Public services
```typescript
class TenantService {
  resolveByHost(host: string): Promise<TenantEntity | null>   // cached: tenant:resolve:{host}
  getById(tenantId: string): Promise<TenantEntity>            // cached
  create(input: CreateTenantDto, ctx: SuperAdminContext): Promise<TenantEntity>
  update(tenantId, input: UpdateTenantDto, ctx): Promise<TenantEntity>
  suspend(tenantId, reason, ctx): Promise<void>
  reactivate(tenantId, ctx): Promise<void>
  switchPlan(tenantId, planId, ctx): Promise<void>            // emits tenant.subscription.changed
  setCustomDomain(tenantId, host, ctx): Promise<void>         // status=PENDING, needs DNS verification
}
```

### 12.6 Key DTOs
`CreateTenantDto { name, subdomain, planId, ownerEmail }` — `subdomain` is normalized to lowercase, validated by regex `^[a-z0-9-]{3,60}$`. Reserved subdomains list rejected.

### 12.7 Events emitted / consumed
- Emits `tenant.created`, `tenant.suspended`, `tenant.reactivated`, `tenant.subscription.changed`, `tenant.domain.verified`.
- Consumes nothing critical; cache invalidates on its own mutations.

### 12.8 Transactions, locks, idempotency
- All mutations are single-row, no cross-domain transactions.
- `suspend()` issues a tenant-wide cache flush via `invalidateTenantCache`.
- No idempotency needed (super-admin operations).

### 12.9 Subscription gate, permissions, errors
- Subscription gate: not applicable (super-admin scope).
- Permissions: `tenant.read`, `tenant.update`, `tenant.suspend`, `tenant.plan.change`, `tenant.domain.manage` — all SUPER_ADMIN only.
- Errors: `TENANT_NOT_FOUND`, `TENANT_SUBDOMAIN_TAKEN`, `TENANT_DOMAIN_NOT_VERIFIED`.

---

## 13. System: Subscription (Plan + Billing)

### 13.1 Purpose & boundary
- **Plan** module owns the catalog of plans + entitlements.
- **Billing** module owns tenant subscription state, invoices, payment of recurring fees, and entitlement caps (e.g., max users, branches, warehouses, storage).

### 13.2 Source layout
```
modules/system/subscription-plan/
├─ entities/                       (subscription-plan.entity, plan-feature.entity)
├─ subscription-plan.service.ts
├─ subscription-plan.repository.ts
├─ subscription-plan.controller.ts          (super-admin)
├─ public-subscription-plan.controller.ts   (public: /plans)
└─ subscription-plan.module.ts

modules/system/subscription-billing/
├─ entities/                       (subscription-invoice, payment, usage-counter)
├─ subscription-billing.service.ts
├─ subscription-invoice.repository.ts
├─ subscription-billing.controller.ts
└─ subscription-billing.module.ts
```

### 13.3 Entities owned
- `subscription_plans` — `id`, `name`, `price_monthly`, `price_yearly`, `features` (JSONB), `caps` (JSONB), `is_active`.
- `plan_features` (optional normalized table) — feature key → boolean / numeric cap.
- `subscription_invoices` — billing invoices issued to tenants.
- `usage_counters` — `tenant_id`, `feature_key`, `value`, `window_start` — for metered features (orders/month, storage MB).

### 13.4 Controllers & routes
| Route | Method | Scope |
| --- | --- | --- |
| `GET /plans` | public | catalog browsing |
| `GET /super-admin/plans` | SUPER_ADMIN | manage plans |
| `POST /super-admin/plans` | SUPER_ADMIN | create |
| `PATCH /super-admin/plans/:id` | SUPER_ADMIN | update |
| `GET /billing/invoices` | tenant ADMIN | own subscription invoices |
| `POST /billing/invoices/:id/pay` | tenant ADMIN | pay |
| `GET /billing/usage` | tenant ADMIN | metered usage |

### 13.5 Public services
```typescript
class SubscriptionPlanService {
  listActive(): Promise<PlanEntity[]>                        // cached, public
  getPlan(planId): Promise<PlanEntity>
  upsertPlan(input, ctx): Promise<PlanEntity>                // super-admin
}
class SubscriptionBillingService {
  getActiveSubscription(ctx): Promise<TenantPlanView>
  canUseFeature(ctx, featureKey): Promise<boolean>           // backs SubscriptionGuard
  incrementUsage(ctx, featureKey, by?): Promise<void>        // counters, capped
  checkCap(ctx, featureKey): Promise<{ allowed: boolean; usage: number; cap: number }>
  generateMonthlyInvoice(tenantId): Promise<SubscriptionInvoice>  // cron job
  recordPayment(invoiceId, amount, ref): Promise<void>
}
```

### 13.6 Key DTOs
- `UpsertPlanDto { name, priceMonthly, priceYearly, features: Record<string, boolean | number>, caps: Record<string, number> }`.
- `RecordPaymentDto { invoiceId, gatewayRef, amount, paidAt }`.

### 13.7 Events emitted / consumed
- Emits `subscription.upgraded`, `subscription.downgraded`, `subscription.invoice.generated`, `subscription.invoice.paid`, `subscription.usage.limit.reached`.
- Consumes `tenant.created` to provision a starter subscription.

### 13.8 Transactions, locks, idempotency
- `incrementUsage` uses pessimistic write on the `usage_counters` row.
- Payment recording is idempotent by `(tenantId, gatewayRef)`.
- Plan changes are single-row mutations.

### 13.9 Subscription gate, permissions, errors
- Permissions: `billing.read`, `billing.pay`, `plan.manage` (super-admin).
- Errors: `PLAN_NOT_FOUND`, `FEATURE_NOT_ENABLED`, `USAGE_CAP_REACHED`, `BILLING_INVOICE_ALREADY_PAID`.

---

## 14. System: Organization (Company / Branch / Warehouse)

### 14.1 Purpose & boundary
Owns the operational hierarchy under a tenant: `companies` (optional legal entities), `branches`, `warehouses`, `warehouse_bins`. These boundaries are referenced by virtually every other module.

### 14.2 Source layout
```
modules/system/organization/
├─ entities/                  (branch.entity, warehouse.entity, warehouse-bin.entity)
├─ controllers/               (branch.controller, warehouse.controller)
├─ services/
├─ repositories/
├─ dto/
└─ organization.module.ts
```

### 14.3 Entities owned
- `branches` — `id`, `tenant_id`, `name`, `type` (RETAIL | OFFICE | HQ), `address`, `is_active`.
- `warehouses` — `id`, `tenant_id`, `name`, `type` (MAIN | TRANSIT | RETURN | CENTRAL), `branch_id` (nullable), `address`, `is_active`.
- `warehouse_bins` — `id`, `warehouse_id`, `zone`, `bin_code`.

### 14.4 Controllers & routes
| Route | Method | Permission |
| --- | --- | --- |
| `GET /system/branches` | list | `org.branch.read` |
| `POST /system/branches` | create | `org.branch.manage` |
| `PATCH /system/branches/:id` | update | `org.branch.manage` |
| `DELETE /system/branches/:id` | deactivate (soft) | `org.branch.manage` |
| `GET /system/warehouses` | list | `org.warehouse.read` |
| `POST /system/warehouses` | create | `org.warehouse.manage` |
| `PATCH /system/warehouses/:id` | update | `org.warehouse.manage` |
| `GET /system/warehouses/:id/bins` | list bins | `org.warehouse.read` |
| `POST /system/warehouses/:id/bins` | add bin | `org.warehouse.manage` |

### 14.5 Public services
```typescript
class BranchService {
  list(ctx): Promise<BranchEntity[]>                        // tenant-scoped
  getById(ctx, branchId): Promise<BranchEntity>
  create(ctx, input: CreateBranchDto): Promise<BranchEntity>  // enforces subscription cap
  update(ctx, branchId, input): Promise<BranchEntity>
  deactivate(ctx, branchId): Promise<void>
}
class WarehouseService {
  list(ctx, filter?): Promise<WarehouseEntity[]>
  getById(ctx, warehouseId): Promise<WarehouseEntity>
  create(ctx, input: CreateWarehouseDto): Promise<WarehouseEntity>  // validates branch_id same tenant
  update(ctx, warehouseId, input): Promise<WarehouseEntity>
  listBins(ctx, warehouseId): Promise<WarehouseBinEntity[]>
  addBin(ctx, warehouseId, input): Promise<WarehouseBinEntity>
}
```

### 14.6 Key DTOs
- `CreateBranchDto { name, type, address, contactPhone? }` — `tenant_id` injected by ctx.
- `CreateWarehouseDto { name, type, branchId? | null, address }` — service validates `branchId` belongs to `ctx.tenantId`.

### 14.7 Events emitted / consumed
- Emits `branch.created`, `branch.deactivated`, `warehouse.created`, `warehouse.deactivated`.
- These trigger cache invalidation in cart/checkout (available pickup branches), POS (active registers per branch).

### 14.8 Transactions, locks, idempotency
- Single-row mutations, no transactions needed.
- `create` checks subscription cap (calls `SubscriptionBillingService.checkCap(ctx, 'branches' | 'warehouses')`).

### 14.9 Subscription gate, permissions, errors
- Subscription cap: `subscription.caps.branches`, `subscription.caps.warehouses`.
- Permissions: `org.branch.{read,manage}`, `org.warehouse.{read,manage}`.
- Errors: `BRANCH_NOT_FOUND`, `WAREHOUSE_NOT_FOUND`, `BRANCH_HAS_OPEN_SHIFTS` (cannot deactivate), `WAREHOUSE_HAS_STOCK` (cannot delete).

---

## 15. System: Audit Log

### 15.1 Purpose & boundary
Append-only mutation log for tenant-scoped high-risk actions. Every service that performs a high-risk action calls `AuditLogService.record()` inside the transaction.

### 15.2 Source layout
```
modules/system/audit-log/
├─ entities/                  (audit-log.entity)
├─ dto/
├─ audit-log.repository.ts
├─ audit-log.service.ts
├─ audit-log.controller.ts
└─ audit-log.module.ts
```

### 15.3 Entities owned
- `audit_logs` — `id`, `tenant_id`, `actor_user_id`, `entity_type`, `entity_id`, `action`, `before_value` (JSONB), `after_value` (JSONB), `reason`, `ip`, `user_agent`, `created_at`.

### 15.4 Controllers & routes
| Route | Method | Permission |
| --- | --- | --- |
| `GET /audit-logs` | list with filter (entity, actor, date range) | `audit.read` |
| `GET /audit-logs/:id` | detail | `audit.read` |

Audit logs are READ-ONLY via API. No update/delete endpoints.

### 15.5 Public services
```typescript
class AuditLogService {
  // Always called inside the parent transaction
  record(ctx, input: {
    entityType: string
    entityId: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REVERSE' | 'OVERRIDE'
    before?: object
    after?: object
    reason?: string
  }, manager?: EntityManager): Promise<void>

  query(ctx, filter): Promise<AuditLogEntity[]>
}
```

### 15.6 Key DTOs
`AuditLogQueryDto { entityType?, entityId?, actorUserId?, action?, from?, to?, page?, limit? }`.

### 15.7 Events emitted / consumed
- Emits none. Consumes nothing.
- It is the *sink* of high-risk events captured directly by services.

### 15.8 Transactions, locks, idempotency
- Always written inside the parent transaction via `manager.save(AuditLogEntity, ...)`.
- Partitioned by month for retention manageability.

### 15.9 Subscription gate, permissions, errors
- Permission: `audit.read` (typically tenant ADMIN / AUDITOR roles).
- Errors: `AUDIT_LOG_NOT_FOUND`.

---

## 16. System: Super-Admin & Platform

### 16.1 Purpose & boundary
Cross-tenant admin operations: platform users, traffic analytics, tenant lifecycle, subscription oversight, customer-support tools. NOT scoped to a tenant — uses `SUPER_ADMIN` role gating.

### 16.2 Source layout
```
modules/system/super-admin/
├─ entities/
├─ super-admin.controller.ts
├─ traffic.repository.ts
├─ traffic.service.ts
└─ super-admin.module.ts

modules/system/platform/
└─ (platform-wide settings: e.g., feature flags)
```

### 16.3 Routes
| Route | Purpose |
| --- | --- |
| `GET /super-admin/dashboard` | KPIs across all tenants |
| `GET /super-admin/traffic` | platform-wide traffic counters |
| `POST /super-admin/impersonate/:tenantId` | issue a short-lived token to impersonate tenant ADMIN (audit always) |

### 16.4 Services
```typescript
class TrafficService {
  record(host, path, status, ms): Promise<void>      // called from middleware
  summary(period): Promise<TrafficSummary>           // for super-admin dashboard
}
```

### 16.5 Permissions & errors
- All endpoints require `userRole === SUPER_ADMIN`.
- Errors: `NOT_AUTHORIZED`.

---

## 17. Identity: Auth (JWT, Session, Admin Auth)

### 17.1 Purpose & boundary
Login (storefront customer + admin staff + super-admin), session refresh, password reset, MFA (if enabled). Issues JWTs that the rest of the system consumes via `JwtAuthGuard`.

### 17.2 Source layout
```
modules/admin/core/auth/
├─ entities/             (session.entity)
├─ controllers/          (auth.controller, admin-auth.controller)
├─ services/             (auth.service)
├─ dtos/
└─ auth.module.ts
```

### 17.3 Entities owned
- `sessions` — `id`, `tenant_id` (nullable for super-admin), `user_id`, `refresh_token_hash`, `ip`, `user_agent`, `expires_at`, `revoked_at`, `created_at`.

### 17.4 Routes
| Route | Body | Returns |
| --- | --- | --- |
| `POST /auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `POST /auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` (rotates) |
| `POST /auth/logout` | (uses bearer) | 204 |
| `POST /auth/forgot-password` | `{ email }` | 202 (always, to prevent enumeration) |
| `POST /auth/reset-password` | `{ token, newPassword }` | 200 |
| `POST /admin/login` | `{ email, password }` | admin staff variant |

### 17.5 Public services
```typescript
class AuthService {
  login(host, email, password): Promise<TokenPair>
  refresh(refreshToken): Promise<TokenPair>         // rotates + revokes prior refresh
  logout(userId, sessionId): Promise<void>
  requestPasswordReset(email): Promise<void>        // sends email; never reveals existence
  resetPassword(token, newPassword): Promise<void>
}
```

### 17.6 Key DTOs
`LoginDto { email, password }`, `RefreshDto { refreshToken }`, `ResetPasswordDto { token, newPassword }`.

### 17.7 Events emitted / consumed
- Emits `auth.login.succeeded`, `auth.login.failed`, `auth.password.reset.requested`, `auth.session.revoked`.
- Failed login counters drive lockout (Redis sliding window).

### 17.8 Transactions, locks, idempotency
- Refresh rotation is a single transaction: insert new session row + revoke old.
- Password reset uses single-use tokens (hashed in Redis with TTL).

### 17.9 Subscription gate, permissions, errors
- Public endpoints. Throttled by `@nestjs/throttler`.
- Errors: `AUTH_INVALID`, `ACCOUNT_LOCKED`, `RESET_TOKEN_INVALID`, `RESET_TOKEN_EXPIRED`.

---

## 18. Identity: User / Role / Permission / RBAC

### 18.1 Purpose & boundary
Owns users, roles, permissions, role-permission and user-role assignments, plus per-user permission overrides. Backs every `PermissionsGuard` check.

### 18.2 Source layout
```
modules/admin/core/user/
├─ entities/             (user, role, permission, staff-invitation,
│                         user-permission-override, user-role-assignment)
├─ controllers/
├─ repositories/
├─ services/
└─ user.module.ts

modules/admin/core/rbac/
├─ rbac.controller.ts
├─ role-management.service.ts
├─ user-permission-override.service.ts
└─ user-role-assignment.service.ts
```

### 18.3 Entities owned
- `users` — `id`, `tenant_id` (nullable for SUPER_ADMIN), `email`, `password_hash`, `name`, `role` (UserRole enum), `is_active`, `default_branch_id`, `default_warehouse_id`, `branch_scope` (text[] or relation), `warehouse_scope` (text[] or relation).
- `roles` — `id`, `tenant_id` (nullable for system roles), `name`, `description`.
- `permissions` — `id`, `code` (e.g. `inventory.adjust.approve`), `description`.
- `role_permissions` — `role_id`, `permission_id`.
- `user_role_assignments` — `user_id`, `role_id`.
- `user_permission_overrides` — `user_id`, `permission_id`, `mode` (ALLOW | DENY), `reason`.
- `staff_invitations` — pending invitations with email + token.

### 18.4 Effective-permission resolution
1. Compute set of roles for the user.
2. Union of `role_permissions` across those roles.
3. Apply `user_permission_overrides`: DENY removes, ALLOW adds.
4. Cache result at `user:{userId}:permissions` with 10-min TTL.
5. Invalidate on any role/permission/override mutation.

### 18.5 Routes
| Route | Permission |
| --- | --- |
| `GET /users` | `user.read` |
| `POST /users` | `user.manage` |
| `PATCH /users/:id` | `user.manage` |
| `POST /users/invite` | `user.invite` |
| `POST /users/accept-invite` | public, token-based |
| `GET /rbac/roles` | `role.read` |
| `POST /rbac/roles` | `role.manage` |
| `POST /rbac/users/:id/roles` | `role.assign` |
| `POST /rbac/users/:id/overrides` | `role.override` |

### 18.6 Public services
```typescript
class UserService {
  list(ctx, filter): Promise<UserEntity[]>
  invite(ctx, email, roleIds): Promise<StaffInvitation>
  acceptInvite(token, name, password): Promise<{ user; tokens }>
  updateScope(ctx, userId, branchScope, warehouseScope): Promise<void>
}
class RoleManagementService {
  upsertRole(ctx, input): Promise<RoleEntity>
  setRolePermissions(ctx, roleId, permissionIds): Promise<void>
}
class UserRoleAssignmentService {
  assign(ctx, userId, roleIds): Promise<void>
  revoke(ctx, userId, roleId): Promise<void>
}
class UserPermissionOverrideService {
  override(ctx, userId, permissionCode, mode, reason): Promise<void>
}
```

### 18.7 Events emitted / consumed
- Emits `user.created`, `user.invited`, `user.role.changed`, `user.permission.overridden`, `user.deactivated`.
- All emissions invalidate the user's permission cache.

### 18.8 Transactions, locks, idempotency
- Mutations are single-row but always wrapped in a tx so the audit log row commits with them.
- Invitation tokens are one-time-use (DB unique + status flip).

### 18.9 Subscription gate, permissions, errors
- Subscription cap: `subscription.caps.users` (max active users).
- Permissions: `user.read`, `user.manage`, `user.invite`, `role.read`, `role.manage`, `role.assign`, `role.override`.
- Errors: `USER_NOT_FOUND`, `EMAIL_ALREADY_REGISTERED`, `USER_CAP_REACHED`, `INVITE_TOKEN_INVALID`, `ROLE_NOT_FOUND`.

---

## 19. Catalog: Product / Variant / Attribute

### 19.1 Purpose & boundary
Owns product master data. Authoritative source of name, description, media, brand/category links, attributes, base prices. Stock is **not** here — it lives in `inventory_ledger`.

### 19.2 Source layout
```
modules/admin/catalog/product/
├─ entities/             (product, variant, attribute)
├─ controllers/
├─ services/
├─ repositories/
├─ dto/
├─ queue/                (product.processor — async indexing & cache work)
└─ product.module.ts
```

### 19.3 Entities owned
- `products` — `id`, `tenant_id`, `sku` (unique per tenant), `slug` (unique per tenant), `name`, `description`, `brand_id`, `category_id`, `base_price`, `tax_rate_id`, `is_active`, `media` (JSONB).
- `variants` — `id`, `product_id`, `tenant_id`, `sku` (unique per tenant), `attribute_values` (JSONB), `extra_price`, `barcode`.
- `attributes` — `id`, `tenant_id`, `name`, `type` (COLOR | SIZE | TEXT | NUMBER), `options` (JSONB).

### 19.4 Routes
| Route | Permission |
| --- | --- |
| `GET /products` | `catalog.product.read` |
| `POST /products` | `catalog.product.manage` |
| `PATCH /products/:id` | `catalog.product.manage` |
| `POST /products/:id/variants` | `catalog.product.manage` |
| `GET /storefront/products` | public storefront (filtered + ranked) |

### 19.5 Public services
```typescript
class ProductService {
  list(ctx, filter): Promise<ProductView[]>          // includes available stock summary
  getById(ctx, productId): Promise<ProductView>
  getBySlug(ctx, slug): Promise<ProductView>         // cached at t:{tenantId}:product:{slug}
  create(ctx, input: CreateProductDto): Promise<ProductEntity>
  update(ctx, productId, input): Promise<ProductEntity>
  addVariant(ctx, productId, input): Promise<VariantEntity>
}
```

### 19.6 Key DTOs
`CreateProductDto { sku, slug, name, brandId?, categoryId?, basePrice, taxRateId?, media?, variants?: VariantInput[] }` — `tenant_id` from ctx.

### 19.7 Events emitted / consumed
- Emits `product.created`, `product.updated`, `product.deactivated`.
- Consumes `inventory.stock.updated` to update cached available counts (background queue).
- Triggers async search index refresh and product-cache eviction.

### 19.8 Transactions, locks, idempotency
- Product + variants are created in one transaction.
- SKU uniqueness enforced by partial unique index `WHERE deleted_at IS NULL`.

### 19.9 Subscription gate, permissions, errors
- Subscription cap: `subscription.caps.products` (max active products).
- Errors: `PRODUCT_NOT_FOUND`, `SKU_TAKEN`, `SLUG_TAKEN`, `PRODUCT_CAP_REACHED`.

---

## 20. Catalog: Brand & Category

### 20.1 Purpose & boundary
Hierarchical taxonomies referenced by products. Tree-structured (parent → children) for categories.

### 20.2 Source layout
```
modules/admin/catalog/brand/      (brand.controller, .service, entities)
modules/admin/catalog/category/   (category.controller, .service, entities)
```

### 20.3 Entities owned
- `brands` — `id`, `tenant_id`, `name`, `slug`, `logo_url`, `is_active`.
- `categories` — `id`, `tenant_id`, `parent_id?`, `name`, `slug`, `path` (LTREE / text), `is_active`.

### 20.4 Routes
- `GET/POST/PATCH/DELETE /brands`
- `GET/POST/PATCH/DELETE /categories`
- `GET /categories/tree` — full tree, cached.

### 20.5 Services
Standard CRUD + `getTree(ctx)` for categories.

### 20.6 Events
- `category.tree.changed` invalidates the tree cache and product listing caches.

### 20.7 Permissions & errors
- `catalog.brand.{read,manage}`, `catalog.category.{read,manage}`.
- Errors: `BRAND_NOT_FOUND`, `CATEGORY_NOT_FOUND`, `CATEGORY_HAS_PRODUCTS`.

---

## 21. Catalog: Pricing

### 21.1 Purpose & boundary
Owns price books and currency conversion. Different customer segments (retail, wholesale, B2B) can have different price books.

### 21.2 Source layout
```
modules/admin/catalog/pricing/
├─ pricing.controller.ts
├─ pricing.service.ts
├─ entities/             (price-book, price-book-item, currency-rate)
└─ pricing.module.ts
```

### 21.3 Entities owned
- `price_books` — `id`, `tenant_id`, `name`, `currency`, `is_default`.
- `price_book_items` — `price_book_id`, `variant_id`, `price`, `effective_from`, `effective_to`.
- `currency_rates` — `tenant_id`, `from`, `to`, `rate`, `as_of_date`.

### 21.4 Routes
- `GET/POST/PATCH /pricing/price-books`
- `POST /pricing/price-books/:id/items` — bulk upsert.
- `GET /pricing/quote?variantId=…&customerId=…&qty=…` — resolves applicable price.

### 21.5 Service
```typescript
class PricingService {
  resolvePrice(ctx, variantId, customerId?, qty?): Promise<{ price, currency, priceBookId }>
  upsertPriceBook(ctx, input): Promise<PriceBook>
  upsertItems(ctx, priceBookId, items): Promise<void>
}
```

### 21.6 Events & errors
- Emits `pricing.book.changed` → invalidates product list cache.
- Errors: `PRICE_BOOK_NOT_FOUND`, `PRICE_BOOK_HAS_ACTIVE_ORDERS`.

---

## 22. Catalog: Review

### 22.1 Purpose & boundary
Customer-submitted reviews on products. Moderation workflow (pending → approved/rejected).

### 22.2 Source layout
```
modules/admin/catalog/review/
├─ controllers/
├─ entities/         (review.entity)
├─ dto/
└─ review.module.ts
```

### 22.3 Routes
- `POST /reviews` — customer creates (auth required).
- `GET /reviews?productId=…` — public, only `APPROVED`.
- `POST /reviews/:id/moderate` — admin approve/reject.

### 22.4 Service
```typescript
class ReviewService {
  create(ctx, productId, rating, body): Promise<Review>
  moderate(ctx, reviewId, decision: 'APPROVE' | 'REJECT', note?): Promise<void>
  averageRating(ctx, productId): Promise<{ avg, count }>
}
```

### 22.5 Permissions & errors
- Customers create; admins moderate (`catalog.review.moderate`).
- Errors: `REVIEW_NOT_FOUND`, `REVIEW_ALREADY_MODERATED`, `RATING_OUT_OF_RANGE`.

---

## 23. Sales: Order & Return

### 23.1 Purpose & boundary
The order aggregate is the central transactional artifact in Sales. Coordinates carts → orders → reservations → payments → fulfillment → ledger entries. Returns are first-class siblings (`order_returns`) that reverse stock and money.

### 23.2 Source layout
```
modules/admin/sales/order/
├─ entities/             (order, order-item, order-return)
├─ controllers/          (order.controller, return.controller)
├─ services/             (order.service, return.service, order-process.helper)
├─ repositoris/          (typo preserved from current code)
├─ dto/
├─ queue/                (order.processor)
└─ order.module.ts
```

### 23.3 Entities owned
- `orders` — `id`, `tenant_id`, `branch_id?`, `user_id?` (customer), `order_no` (unique per tenant), `status` (DRAFT | PENDING | CONFIRMED | PAID | SHIPPED | DELIVERED | CANCELED | RETURNED), `subtotal`, `discount_total`, `tax_total`, `shipping_total`, `grand_total`, `currency`, `payment_method`, `payment_status`, `coupon_code?`, snapshot fields, audit cols.
- `order_items` — `id`, `order_id`, `tenant_id`, `variant_id`, `name_snapshot`, `sku_snapshot`, `unit_price_snapshot`, `qty`, `discount`, `tax`, `line_total`.
- `order_returns` — `id`, `tenant_id`, `order_id`, `reason`, `status` (PENDING | APPROVED | REJECTED | REFUNDED), `refund_method` (CASH | WALLET | ORIGINAL), `total_refunded`.

### 23.4 Routes
| Route | Permission |
| --- | --- |
| `POST /orders` | `sales.order.create` |
| `GET /orders` | `sales.order.read` |
| `GET /orders/:id` | `sales.order.read` |
| `PATCH /orders/:id` | `sales.order.update` |
| `POST /orders/:id/cancel` | `sales.order.cancel` |
| `POST /orders/:id/confirm` | `sales.order.confirm` |
| `POST /returns` | `sales.return.create` |
| `POST /returns/:id/approve` | `sales.return.approve` |

### 23.5 Public services
```typescript
class OrderService {
  createFromCart(ctx, input: CreateOrderDto): Promise<OrderEntity>
  // workflow: load cart → quote prices → apply coupon/promo → reserve stock
  //           → create order + items → init payment → emit order.created

  confirmPayment(ctx, orderId, paymentRef): Promise<OrderEntity>
  // workflow: insert payment → mark paid → consume reservation → write SALE ledger
  //           → fulfillment.createTask → enqueue post-journal → emit order.paid

  cancel(ctx, orderId, reason): Promise<OrderEntity>
  // workflow: release reservation → update status → reverse journal if posted
  //           → emit order.canceled

  list(ctx, filter: FilterOrderDto): Promise<Paginated<OrderListItem>>
  get(ctx, orderId): Promise<OrderDetail>
}

class ReturnService {
  create(ctx, input: CreateReturnDto): Promise<OrderReturn>
  approve(ctx, returnId, decision: 'REFUND_CASH' | 'REFUND_WALLET' | 'REJECT'): Promise<OrderReturn>
  // workflow on APPROVE+REFUND: SALE_RETURN ledger → wallet credit OR cash refund
  //                            → reverse-revenue journal → emit order.returned
}
```

### 23.6 Key DTOs
- `CreateOrderDto { items: { variantId, qty }[], shippingAddressId?, couponCode?, paymentMethod, branchId? }`.
- `CreateReturnDto { orderId, items: { orderItemId, qty }[], reason, refundMethod }`.

### 23.7 Events emitted / consumed
- Emits `order.created`, `order.paid`, `order.canceled`, `order.shipped` (relayed by fulfillment), `order.returned`.
- Consumes `payment.captured` (gateway webhook) to call `confirmPayment`.

### 23.8 Transactions, locks, idempotency
- `createFromCart` opens a `QueryRunner`. Steps inside one tx: insert order + items + reservations + coupon usage + outbox.
- `confirmPayment` opens a `QueryRunner`. Steps: insert payment, update order status, write inventory ledger (SALE), write AR ledger (if credit sale), insert outbox (accounting), reduce shift totals (for POS).
- Stock reservations use advisory lock `tenant:{tenantId}:stock:{warehouseId}:{variantId}` before checking availability.
- Idempotency: payment webhook keyed by `(tenantId, gatewayTxnId)`.

### 23.9 Subscription gate, permissions, errors
- Subscription cap: `subscription.caps.orders_per_month` (metered via `incrementUsage`).
- Errors: `STOCK_INSUFFICIENT`, `COUPON_INVALID`, `COUPON_EXPIRED`, `COUPON_USAGE_EXCEEDED`, `PAYMENT_FAILED`, `ORDER_NOT_FOUND`, `ORDER_ALREADY_PAID`, `ORDER_CANNOT_BE_CANCELED`, `RETURN_WINDOW_EXPIRED`.

---

## 24. Sales: Cart

### 24.1 Purpose & boundary
Persistent cart aggregate per session/user before an order is created. Includes line items, applied coupons (preview), and totals (snapshot vs live).

### 24.2 Source layout
```
modules/admin/sales/cart/
├─ controllers/
├─ entities/         (cart, cart-item)
├─ dto/
├─ repositories/
└─ cart.module.ts

modules/store/cart/  (storefront-facing variant)
```

### 24.3 Routes
- `GET/POST/PATCH/DELETE /carts` (admin)
- `GET /store/cart` (current user)
- `POST /store/cart/items` (add item)
- `DELETE /store/cart/items/:variantId` (remove)
- `POST /store/cart/apply-coupon` (preview totals)

### 24.4 Services
```typescript
class CartService {
  getOrCreate(ctx, sessionId?): Promise<CartEntity>
  addItem(ctx, cartId, variantId, qty): Promise<CartEntity>
  removeItem(ctx, cartId, variantId): Promise<CartEntity>
  applyCoupon(ctx, cartId, code): Promise<CartEntity>
  computeTotals(ctx, cartId): Promise<CartTotals>
}
```

### 24.5 Notes
- Stock is NOT reserved when adding to cart. Reservation happens at order creation.
- Coupon validity is recomputed on every read (`computeTotals`).

---

## 25. Sales: Coupon

### 25.1 Purpose & boundary
Single-use or limited-use discount codes, evaluated by a rules engine against carts/orders. Persists usage history for limits.

### 25.2 Source layout
```
modules/admin/sales/coupon/
├─ entities/        (coupon, coupon-usage)
├─ controllers/
├─ services/        (coupon.service — strategy-pattern resolver)
├─ dto/
└─ coupon.module.ts
```

### 25.3 Entities owned
- `coupons` — `id`, `tenant_id`, `code` (unique per tenant), `discount_type` (PERCENT | FIXED | FREE_SHIPPING), `value`, `min_order`, `max_uses_total`, `max_uses_per_user`, `starts_at`, `ends_at`, `is_active`.
- `coupon_usages` — `id`, `tenant_id`, `coupon_id`, `user_id`, `order_id`, `applied_at`.

### 25.4 Services
```typescript
class CouponService {
  validate(ctx, code, cart): Promise<CouponEvaluation>           // pure, no writes
  consume(ctx, code, orderId, userId, manager): Promise<void>    // writes coupon_usages inside order tx
}
```

### 25.5 Rules
- Validity: not expired, within `max_uses_total`, within `max_uses_per_user`, cart meets `min_order`.
- Strategy resolver: `FixedDiscount | PercentDiscount | FreeShipping`.
- All writes happen inside the parent order transaction.

### 25.6 Errors
`COUPON_NOT_FOUND`, `COUPON_INACTIVE`, `COUPON_EXPIRED`, `COUPON_MIN_NOT_MET`, `COUPON_USAGE_EXCEEDED`, `COUPON_USER_LIMIT_EXCEEDED`.

---

## 26. Sales: Promotion

### 26.1 Purpose & boundary
Server-side automatic promotions (no code required): "buy 2 get 1", "20% off all of brand X this weekend", segment-based price drops. Distinct from coupons (manual code) and campaigns (marketing dispatch).

### 26.2 Source layout
```
modules/admin/sales/promotion/
├─ entities/        (promotion, promotion-rule)
├─ controllers/
├─ services/
├─ enums/
└─ promotion.module.ts
```

### 26.3 Service
```typescript
class PromotionService {
  list(ctx, activeOnly?): Promise<Promotion[]>
  applicable(ctx, cart): Promise<Promotion[]>             // resolves active applicable rules
  apply(ctx, cart): { adjustedItems, totalDiscount }      // mutation of cart totals
}
```

### 26.4 Rule schema (JSONB)
```json
{
  "scope": { "brandIds": [...], "categoryIds": [...], "variantIds": [...] },
  "trigger": { "minQty": 2, "minAmount": 1000, "timeWindow": { "from": "...", "to": "..." } },
  "effect": { "type": "PERCENT", "value": 20 }
}
```

### 26.5 Errors
`PROMOTION_NOT_APPLICABLE`, `PROMOTION_EXPIRED`.

---

## 27. Sales: Payment

### 27.1 Purpose & boundary
Records customer-facing payments against orders, plus refunds. Bridges Sales ↔ Finance via outbox + events. Integrates with multiple gateways via a Strategy adapter.

### 27.2 Source layout
```
modules/admin/sales/payment/
├─ entities/             (payment, refund)
├─ controllers/          (payment.controller, payment-action.controller)
├─ services/
├─ repositoris/          (typo preserved)
└─ payment.module.ts
```

### 27.3 Entities owned
- `payments` — `id`, `tenant_id`, `order_id`, `method` (CASH | CARD | WALLET | BANK | COD | ACCOUNT), `amount`, `currency`, `status` (PENDING | CAPTURED | FAILED | REFUNDED), `gateway`, `gateway_ref`, `captured_at`.
- `refunds` — `id`, `payment_id`, `amount`, `method`, `status`, `gateway_ref`.

### 27.4 Routes
- `POST /payments/:orderId/init` — server-side start, returns redirect/checkout URL.
- `POST /payment/webhook/:gateway` — public, signature-verified, idempotent on `gatewayRef`.
- `POST /payments/:id/refund` — staff initiates refund.

### 27.5 Service
```typescript
class PaymentService {
  init(ctx, orderId, method): Promise<{ redirectUrl?, status }>
  capture(ctx, paymentId, gatewayRef): Promise<Payment>
  webhook(gateway, signedPayload): Promise<void>          // idempotent
  refund(ctx, paymentId, amount, reason): Promise<Refund>
}
```

### 27.6 Idempotency
Webhook idempotency: `(tenantId, gateway, gatewayTxnId)` as DB unique. Repeated calls return cached response.

### 27.7 Events
- Emits `payment.captured`, `payment.failed`, `refund.issued`.
- `payment.captured` → triggers `OrderService.confirmPayment`.

### 27.8 Errors
`PAYMENT_NOT_FOUND`, `PAYMENT_ALREADY_CAPTURED`, `WEBHOOK_SIGNATURE_INVALID`, `REFUND_EXCEEDS_PAID`.

---

## 28. Sales: POS (Register · Shift · Drawer)

### 28.1 Purpose & boundary
In-store retail register sales. PWA on the client; backend assembles register + shift + drawer-transactions + offline-sync into one cohesive workflow.

### 28.2 Source layout
```
modules/admin/sales/pos/
├─ entities/         (pos-register, pos-shift, pos-drawer-transaction)
├─ repositories/
├─ pos.controller.ts
├─ pos.service.ts
└─ pos.module.ts
```

### 28.3 Entities owned
- `pos_registers` — `id`, `tenant_id`, `branch_id`, `name`, `is_active`.
- `pos_shifts` — `id`, `tenant_id`, `register_id`, `user_id`, `opened_at`, `closed_at?`, `opening_cash`, `expected_close_cash`, `actual_close_cash`, `variance`, `total_sales`, `total_returns`, `status` (OPEN | CLOSED | RECONCILED).
- `pos_drawer_transactions` — `id`, `shift_id`, `type` (CASH_IN | CASH_OUT | PAYOUT | DROP), `amount`, `reason`, `user_id`, `at`.

### 28.4 Routes
| Route | Permission |
| --- | --- |
| `POST /pos/shifts/open` | `pos.shift.open` |
| `POST /pos/shifts/:id/close` | `pos.shift.close` |
| `POST /pos/sales/sync` | `pos.sale.sync` (idempotent on `clientSaleId`) |
| `POST /pos/drawer/cash-in` | `pos.drawer.manage` |
| `POST /pos/drawer/cash-out` | `pos.drawer.manage` |
| `GET /pos/shifts/:id/z-report` | `pos.report.read` |

### 28.5 Service
```typescript
class PosService {
  openShift(ctx, registerId, openingCash): Promise<PosShift>
  recordSale(ctx, input: PosSaleSyncDto): Promise<OrderEntity>  // idempotent on clientSaleId
  drawerTransaction(ctx, shiftId, type, amount, reason): Promise<PosDrawerTransaction>
  closeShift(ctx, shiftId, actualCash): Promise<{ shift, zReport }>
}
```

### 28.6 Invariants enforced
- One open shift per `(tenantId, userId)` — partial unique index `WHERE status = 'OPEN'`.
- Sale sync idempotency — unique index `(tenantId, clientSaleId)`.
- Closed shift rejects new sales (`SHIFT_CLOSED`).
- Cash variance always recorded with reason.

### 28.7 Transactions
- `recordSale` opens a `QueryRunner` covering: idempotency check, order + items insert, payment insert, inventory ledger SALE, shift totals increment, outbox event. Commit, then emit `order.paid`.

### 28.8 Events
- Emits `pos.shift.opened`, `pos.shift.closed`, `pos.sale.synced`, `pos.drawer.changed`.

### 28.9 Permissions & errors
- `pos.shift.{open,close}`, `pos.sale.sync`, `pos.drawer.manage`, `pos.report.read`.
- Errors: `ONE_OPEN_SHIFT_ONLY`, `SHIFT_CLOSED`, `DUPLICATE_IDEMPOTENCY_KEY`, `REGISTER_NOT_FOUND`.

---

## 29. Inventory: Ledger / Reservation / Transfer / Batch

### 29.1 Purpose & boundary
Authoritative source of stock truth. Three append-only ledgers + one reservation table + one transfer document + batch/lot tracking.

### 29.2 Source layout
```
modules/admin/operations/logistics/inventory-transaction/
├─ entities/  (inventory-ledger, stock-reservation, stock-transfer,
│              stock-transfer-item, product-batch)
├─ dto/
├─ inventory-ledger.controller.ts          inventory-ledger.service.ts          inventory-ledger.repository.ts
├─ stock-reservation.controller.ts         stock-reservation.service.ts         stock-reservation-scheduler.service.ts
├─ stock-transfer.controller.ts            stock-transfer.service.ts
├─ product-batch.controller.ts             product-batch.service.ts
└─ inventory-transaction.module.ts
```

### 29.3 Entities owned
- `inventory_ledger` — append-only: `id`, `tenant_id`, `warehouse_id`, `variant_id`, `qty_delta` (±), `type` (PURCHASE | SALE | TRANSFER_OUT | TRANSFER_IN | ADJUSTMENT_IN | ADJUSTMENT_OUT | RETURN_IN), `reference_type`, `reference_id`, `unit_cost?`, `batch_lot_id?`, `created_at`, `created_by`.
- `stock_reservations` — `id`, `tenant_id`, `warehouse_id`, `variant_id`, `qty`, `status` (ACTIVE | CONSUMED | EXPIRED | RELEASED), `reference_type`, `reference_id`, `expires_at`.
- `stock_transfers` — `id`, `tenant_id`, `source_warehouse_id`, `dest_warehouse_id`, `status` (DRAFT | APPROVED | IN_TRANSIT | RECEIVED | CANCELED), `requested_by`, `approved_by`, `received_by`, `notes`.
- `stock_transfer_items` — `id`, `transfer_id`, `variant_id`, `qty_requested`, `qty_shipped`, `qty_received`.
- `product_batches` — `id`, `tenant_id`, `variant_id`, `batch_no`, `expiry_date?`, `mfg_date?`, `received_qty`, `remaining_qty`.

### 29.4 Routes
| Route | Permission |
| --- | --- |
| `GET /inventory-ledger` | `inventory.ledger.read` |
| `POST /admin/inventory/reservations` | `inventory.reserve` (internal/service) |
| `DELETE /admin/inventory/reservations/:id` | `inventory.reserve.release` |
| `POST /stock-transfers` | `inventory.transfer.create` |
| `POST /stock-transfers/:id/approve` | `inventory.transfer.approve` |
| `POST /stock-transfers/:id/ship` | `inventory.transfer.ship` |
| `POST /stock-transfers/:id/receive` | `inventory.transfer.receive` |
| `GET /product-batches` | `inventory.batch.read` |

### 29.5 Services
```typescript
class InventoryLedgerService {
  append(ctx, row, manager): Promise<void>                       // inside parent tx
  onHand(ctx, variantId, warehouseId): Promise<number>           // SUM(qty_delta)
  asOf(ctx, variantId, warehouseId, date): Promise<number>       // SUM up to date
}
class StockReservationService {
  reserve(ctx, variantId, warehouseId, qty, refType, refId, ttlMin): Promise<Reservation>
  release(ctx, reservationId): Promise<void>
  consume(ctx, reservationId, manager): Promise<void>            // when shipping
  available(ctx, variantId, warehouseId): Promise<number>        // onHand - activeReservations
}
class StockTransferService {
  create(ctx, input): Promise<StockTransfer>                     // DRAFT
  approve(ctx, transferId): Promise<void>
  ship(ctx, transferId): Promise<void>                           // writes TRANSFER_OUT ledger
  receive(ctx, transferId, actualQtys): Promise<void>            // writes TRANSFER_IN ledger
}
class ProductBatchService {
  receive(ctx, variantId, batchNo, qty, expiry?): Promise<Batch>
  consume(ctx, batchId, qty, manager): Promise<void>             // FIFO/FEFO consumption
}
```

### 29.6 Reservation scheduler
`StockReservationSchedulerService` is a cron that flips `ACTIVE → EXPIRED` for reservations past `expires_at` and releases their qty back to availability. Runs every 1 minute.

### 29.7 Transactions, locks, idempotency
- Every ledger append happens inside the caller's transaction.
- `reserve()` acquires advisory lock `tenant:{tenantId}:stock:{warehouseId}:{variantId}` before computing availability.
- Negative on-hand requires explicit `permission inventory.negative.allow`.

### 29.8 Events
- Emits `inventory.stock.updated`, `stock.low` (when onHand < reorder_point), `stock.transfer.received`.
- Consumed by procurement (auto-PR draft on `stock.low`).

### 29.9 Permissions & errors
- `inventory.ledger.read`, `inventory.reserve`, `inventory.adjust.{create,approve}`, `inventory.transfer.{create,approve,ship,receive}`, `inventory.batch.{read,manage}`, `inventory.negative.allow`.
- Errors: `STOCK_INSUFFICIENT`, `STOCK_NEGATIVE_FORBIDDEN`, `RESERVATION_EXPIRED`, `TRANSFER_NOT_APPROVED`, `BATCH_EXPIRED`.

---

## 30. Procurement: PR / RFQ / PO / Supplier Invoice / Debit Note

### 30.1 Purpose & boundary
Procure-to-pay backbone. Document chain: Purchase Requisition → RFQ → Quotations → Purchase Order → GRN → Supplier Invoice → 3-Way Match → Supplier Payment, with Debit Notes for returns to suppliers.

### 30.2 Source layout
```
modules/admin/operations/finance/purchase/
├─ entities/  (purchase-requisition, purchase-requisition-item, rfq, quotation,
│              purchase-order, purchase-order-item, supplier-invoice,
│              supplier-invoice-item, supplier-payment, debit-note)
├─ controllers/  (purchase-requisition, rfq, purchase-order, supplier-invoice, debit-note)
├─ services/
├─ repositories/
├─ enums/
└─ purchase.module.ts
```

### 30.3 Routes (selection)
| Route | Permission |
| --- | --- |
| `POST /purchase-requisitions` | `procurement.pr.create` |
| `POST /purchase-requisitions/:id/approve` | `procurement.pr.approve` |
| `POST /rfqs` (from PR) | `procurement.rfq.create` |
| `POST /rfqs/:id/quotes` | `procurement.quote.submit` |
| `POST /purchase-orders` | `procurement.po.create` |
| `POST /purchase-orders/:id/approve` | `procurement.po.approve` |
| `POST /supplier-invoices` | `procurement.invoice.record` |
| `POST /supplier-invoices/:id/match` | `procurement.invoice.match` |
| `POST /debit-notes` | `procurement.debit.create` |

### 30.4 Services
```typescript
class PurchaseRequisitionService {
  create(ctx, input): Promise<PurchaseRequisition>          // status DRAFT
  approve(ctx, prId): Promise<void>
  convertToRfq(ctx, prId): Promise<RFQ>
}
class RfqService {
  create(ctx, prId, supplierIds): Promise<RFQ>
  submitQuote(ctx, rfqId, supplierId, items): Promise<Quotation>
  awardTo(ctx, rfqId, supplierId): Promise<PurchaseOrder>
}
class PurchaseOrderService {
  create(ctx, input): Promise<PurchaseOrder>
  approve(ctx, poId): Promise<void>
  cancel(ctx, poId, reason): Promise<void>
  // GRN against PO is handled by GRN service (module 32)
}
class SupplierInvoiceService {
  record(ctx, input): Promise<SupplierInvoice>
  threeWayMatch(ctx, invoiceId): Promise<MatchResult>      // PO ↔ GRN ↔ Invoice qty + amount
  recordPayment(ctx, invoiceId, paymentInput): Promise<SupplierPayment>
}
class DebitNoteService {
  create(ctx, supplierId, items, reason): Promise<DebitNote>
  apply(ctx, debitNoteId): Promise<void>                   // reduces AP
}
```

### 30.5 Transactions & events
- `recordPayment` writes `supplier_payments` + appends `supplier_ap_ledger` + posts journal (DR AP / CR Cash) — all inside one `QueryRunner` tx + outbox.
- `threeWayMatch` is read-only verification; failure raises `THREE_WAY_MATCH_FAILED` and blocks payment unless overridden by `procurement.invoice.override` permission.
- Emits `purchase.requisition.approved`, `purchase.order.approved`, `supplier.invoice.posted`, `supplier.payment.released`, `debit.note.created`.

### 30.6 Permissions & errors
- See routes table.
- Errors: `PR_NOT_FOUND`, `PO_NOT_APPROVED`, `INVOICE_OVER_PO`, `THREE_WAY_MATCH_FAILED`, `PAYMENT_EXCEEDS_OPEN_AP`.

---

## 31. Procurement: Supplier (master + AP ledger + portal)

### 31.1 Purpose & boundary
Supplier master data + tenant-wide AP ledger + optional supplier portal (where suppliers self-service quotes and invoices via a separate auth scope).

### 31.2 Source layout
```
modules/admin/operations/finance/supplier/
├─ entities/         (supplier, supplier-contact, supplier-bank-account)
├─ dto/
├─ enums/
├─ supplier.controller.ts        supplier.service.ts        supplier.repository.ts
├─ supplier-ap-ledger.repository.ts
├─ supplier-portal.controller.ts
└─ supplier.module.ts
```

### 31.3 Entities owned
- `suppliers` — `id`, `tenant_id`, `name`, `code` (unique per tenant), `tax_id`, `payment_terms_days`, `default_currency`, `is_active`.
- `supplier_ap_ledger` — append-only: `id`, `tenant_id`, `supplier_id`, `txn_type` (INVOICE | PAYMENT | DEBIT_NOTE | ADJUSTMENT), `amount` (±), `reference_type`, `reference_id`, `entry_date`.

### 31.4 Service
```typescript
class SupplierService {
  list / get / create / update / deactivate
  apBalance(ctx, supplierId): Promise<number>          // SUM(ap_ledger.amount)
  apAging(ctx, supplierId, asOf?): Promise<AgingBuckets>   // 0-30/31-60/61-90/90+
}
```

### 31.5 Permissions & errors
- `procurement.supplier.{read,manage}`.
- Errors: `SUPPLIER_NOT_FOUND`, `SUPPLIER_CODE_TAKEN`.

---

## 32. Logistics: GRN

### 32.1 Purpose & boundary
Goods Received Note — the receiving document that turns a PO + physical delivery into stock IN + AP accrual.

### 32.2 Source layout
```
modules/admin/operations/logistics/grn/
├─ entities/        (goods-received-note, grn-item)
├─ dto/
├─ grn.controller.ts        grn.service.ts        grn.repository.ts
└─ grn.module.ts
```

### 32.3 Entities owned
- `goods_received_notes` — `id`, `tenant_id`, `po_id?`, `supplier_id`, `warehouse_id`, `received_by`, `received_at`, `status` (PENDING | VERIFIED | REJECTED), `total_value`.
- `grn_items` — `id`, `grn_id`, `po_item_id?`, `variant_id`, `qty_received`, `unit_cost`, `batch_no?`, `expiry_date?`.

### 32.4 Routes
| Route | Permission |
| --- | --- |
| `POST /operations/logistics/grn` | `logistics.grn.create` |
| `POST /operations/logistics/grn/:id/verify` | `logistics.grn.verify` |
| `POST /operations/logistics/grn/:id/reject` | `logistics.grn.verify` |

### 32.5 Service
```typescript
class GrnService {
  create(ctx, input: CreateGrnDto): Promise<Grn>          // PENDING
  verify(ctx, grnId): Promise<Grn>
  // workflow: validate qty against PO (tolerance)
  //           → write inventory_ledger PURCHASE rows + product_batches
  //           → write supplier_ap_ledger (INVOICE accrual)
  //           → post journal DR Inventory / CR AP via outbox
  //           → emit grn.verified
  reject(ctx, grnId, reason): Promise<Grn>
}
```

### 32.6 Transactions, locks
- `verify` is a `QueryRunner` tx: GRN status, inventory ledger rows, AP ledger rows, batches, outbox.
- Lock supplier AP row + each variant's stock row (lock order: supplier → variant → warehouse).

### 32.7 Events
- Emits `grn.verified` (consumed by Finance → AP), `inventory.stock.updated`.

### 32.8 Errors
`GRN_NOT_FOUND`, `GRN_ALREADY_VERIFIED`, `GRN_QTY_EXCEEDS_PO`, `PO_NOT_APPROVED`.

---

## 33. Logistics: Fulfillment

### 33.1 Purpose & boundary
Picks, packs, ships orders. Handles split-shipment when an order's lines come from multiple warehouses. Hand-off point to Courier.

### 33.2 Source layout
```
modules/admin/operations/logistics/fulfillment/
├─ entities/        (fulfillment-task, fulfillment-item)
├─ dto/  enums/
├─ fulfillment.controller.ts  fulfillment.service.ts  fulfillment.repository.ts
└─ fulfillment.module.ts
```

### 33.3 Routes
| Route | Permission |
| --- | --- |
| `POST /operations/logistics/fulfillment` | `logistics.fulfillment.create` (auto from order.paid) |
| `POST /operations/logistics/fulfillment/:id/pick` | `logistics.fulfillment.pick` |
| `POST /operations/logistics/fulfillment/:id/pack` | `logistics.fulfillment.pack` |
| `POST /operations/logistics/fulfillment/:id/ship` | `logistics.fulfillment.ship` |

### 33.4 Service
```typescript
class FulfillmentService {
  createForOrder(ctx, orderId): Promise<FulfillmentTask[]>      // splits per warehouse
  pick(ctx, taskId): Promise<void>
  pack(ctx, taskId): Promise<void>
  ship(ctx, taskId, courierId?): Promise<void>
  // workflow on ship: consume reservation → write inventory_ledger SALE
  //                  → call courier service if integrated
  //                  → emit order.shipped
}
```

### 33.5 Transactions
- `ship()` is a cross-domain `QueryRunner` tx: reservation consume, ledger SALE, fulfillment status, optional courier shipment row, outbox.

### 33.6 Events
- Emits `order.shipped`, `fulfillment.completed`.

### 33.7 Errors
`FULFILLMENT_NOT_FOUND`, `ORDER_NOT_PAID`, `RESERVATION_MISSING`, `COURIER_UNAVAILABLE`.

---

## 34. Logistics: Courier (Pathao / Steadfast / Webhooks)

### 34.1 Purpose & boundary
Adapters for third-party couriers (Pathao, Steadfast) used in Bangladesh. Handles outbound API calls (create shipment, track) and inbound webhooks for status updates.

### 34.2 Source layout
```
modules/admin/operations/logistics/courier/
├─ pathao/         (pathao.controller, pathao.service, pathao-adapter)
├─ steadfast/      (steadfast.controller, steadfast.service)
├─ webhooks/       (courier-webhook.controller)
└─ courier.module.ts
```

### 34.3 Routes
| Route | Purpose |
| --- | --- |
| `POST /courier/pathao/shipments` | create Pathao shipment for an order |
| `POST /courier/steadfast/shipments` | create Steadfast shipment |
| `POST /courier/webhooks/:provider` | inbound, signed, idempotent |
| `GET /courier/track/:provider/:waybill` | status lookup |

### 34.4 Service abstraction
```typescript
interface CourierAdapter {
  name: 'PATHAO' | 'STEADFAST'
  createShipment(ctx, payload): Promise<{ waybillId, label?, cost? }>
  trackStatus(ctx, waybillId): Promise<CourierStatus>
  handleWebhook(rawBody, signature): Promise<CourierEvent>
}
```

### 34.5 Idempotency
Webhook events stored with `(provider, waybillId, eventType, eventTimestamp)` unique key.

### 34.6 Events
- Emits `courier.status.changed` → updates `fulfillment_tasks.status`.

### 34.7 Errors
`COURIER_UNAVAILABLE`, `COURIER_AUTH_FAILED`, `WEBHOOK_SIGNATURE_INVALID`.

---

## 35. Finance: Accounting (Journal · AR · Wallet · Tax · Dunning · Reports · COGS)

### 35.1 Purpose & boundary
The accounting subsystem. Chart of Accounts + immutable journal/ledger + AR ledger + customer wallet ledger + tax rules + dunning automation + financial reports (P&L, BS, CF). Receives **all** financial side-effects via the outbox.

### 35.2 Source layout
```
modules/admin/operations/finance/accounting/
├─ entities/   (account, journal-entry, ledger-entry, ar-ledger, wallet-ledger,
│               fiscal-period, tax-rule, dunning-rule, dunning-log,
│               accounting-outbox)
├─ controllers/  (accounting, ar, tax, wallet)
├─ services/     (accounting, accounting-integration, accounting-outbox,
│                 ar, cogs, dunning, financial-report, tax, wallet)
├─ constants/
└─ accounting.module.ts
```

### 35.3 Entities owned
- `accounts` — Chart of Accounts: `id`, `tenant_id`, `code`, `name`, `type` (ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE), `parent_id?`, `is_active`.
- `journal_entries` — header: `id`, `tenant_id`, `entry_date`, `description`, `reference_type`, `reference_id`, `posted_at`, `reversed_by_id?`.
- `ledger_entries` — lines (the *real* double-entry rows): `id`, `journal_id`, `tenant_id`, `account_id`, `branch_id?`, `side` (DEBIT | CREDIT), `amount`, `currency`, `fx_rate`.
- `ar_ledger` — append-only customer AR txns: `id`, `tenant_id`, `customer_id`, `txn_type` (INVOICE | PAYMENT | CREDIT_NOTE | ADJUSTMENT), `amount` (±), `reference_type`, `reference_id`.
- `wallet_ledger` — append-only customer wallet/store-credit: `id`, `tenant_id`, `user_id`, `txn_type` (CREDIT | DEBIT | EXPIRY | REFUND), `amount` (±), `reference_type`, `reference_id`, `expires_at?`.
- `fiscal_periods` — `id`, `tenant_id`, `name` (e.g. '2026-Q1'), `start`, `end`, `status` (OPEN | CLOSED).
- `tax_rules` — `id`, `tenant_id`, `name`, `rate`, `jurisdiction`, `applies_to`.
- `dunning_rules` — `id`, `tenant_id`, `name`, `trigger_days_overdue`, `action` (REMINDER | LATE_FEE | HOLD).
- `dunning_log` — per-customer reminder/action audit trail.
- `accounting_outbox` — specialized outbox for journal posting jobs.

### 35.4 Routes (selection)
| Route | Permission |
| --- | --- |
| `GET /finance/accounting/accounts` | `finance.account.read` |
| `POST /finance/accounting/journals` | `finance.journal.post` |
| `POST /finance/accounting/journals/:id/reverse` | `finance.journal.reverse` |
| `GET /finance/ar/customers/:id/balance` | `finance.ar.read` |
| `GET /finance/ar/aging` | `finance.ar.read` |
| `POST /finance/wallet/credit` | `finance.wallet.adjust` |
| `GET /finance/wallet/:userId/balance` | `finance.wallet.read` |
| `GET /finance/tax/rules` | `finance.tax.read` |

### 35.5 Public services
```typescript
class AccountingService {
  postJournal(ctx, input: PostJournalInput, manager?): Promise<JournalEntry>
  // - validates fiscal period open
  // - validates balance (DR == CR)
  // - inserts journal_entries + ledger_entries (immutable)
  reverseJournal(ctx, journalId, reason): Promise<JournalEntry>
  // - creates a new journal with negated lines; links via reversed_by_id

  accountBalance(ctx, accountId, asOf?): Promise<number>          // SUM(ledger_entries)
  ensureCoaSeeded(ctx): Promise<void>                              // idempotent CoA bootstrap
}

class AccountingOutboxService {
  enqueue(ctx, eventType, payload, manager): Promise<void>         // inside parent tx
  dispatchPending(): Promise<number>                               // cron: outbox → BullMQ
}

class AccountingIntegrationService {
  // The single place where modules other than Finance request a posting.
  postOrderPaidJournal(ctx, order, payment, manager): Promise<void>
  postGrnVerifiedJournal(ctx, grn, manager): Promise<void>
  postSupplierPaymentJournal(ctx, supplierPayment, manager): Promise<void>
  postPayrollApprovedJournal(ctx, batch, manager): Promise<void>
  postExpenseJournal(ctx, expense, manager): Promise<void>
  postWalletCreditJournal(ctx, walletTxn, manager): Promise<void>
}

class ArService {
  applyTransaction(ctx, input: ArTxnInput, manager): Promise<void>  // append + emit
  balance(ctx, customerId): Promise<number>
  aging(ctx, asOf?): Promise<Aging[]>
}

class WalletService {
  credit(ctx, userId, amount, ref, manager): Promise<WalletLedger>
  debit(ctx, userId, amount, ref, manager): Promise<WalletLedger>
  balance(ctx, userId): Promise<number>
  expireOldEntries(): Promise<void>                                 // cron
}

class TaxService {
  computeForOrder(ctx, lines, address?): Promise<{ taxTotal, breakdown }>
}

class DunningService {
  runRules(): Promise<void>                                         // cron, daily
}

class FinancialReportService {
  profitAndLoss(ctx, from, to, branchId?): Promise<PnLReport>
  balanceSheet(ctx, asOf, branchId?): Promise<BalanceSheetReport>
  cashFlow(ctx, from, to, branchId?): Promise<CashFlowReport>
}

class CogsService {
  resolveUnitCost(ctx, variantId, warehouseId, qty, method: 'FIFO' | 'AVG'): Promise<number>
}
```

### 35.6 Invariants enforced
- Every journal balances (`DR === CR`).
- Posted journals are immutable — corrections via `reverseJournal`.
- `entry_date` must fall inside an OPEN fiscal period.
- AR / wallet / AP ledgers are append-only.
- `postJournal` requires lock on each affected account row.

### 35.7 Transactions
- All "post journal" paths inside a parent tx; outbox row goes in the same tx, dispatcher publishes to BullMQ later.

### 35.8 Events & queues
- Consumes outbox via `accounting-queue` `post-journal` jobs.
- Emits `journal.posted`, `journal.reversed`, `ar.balance.changed`, `wallet.balance.changed`.

### 35.9 Permissions & errors
- `finance.journal.{post,reverse}`, `finance.account.{read,manage}`, `finance.ar.read`, `finance.wallet.{read,adjust}`, `finance.period.close`, `finance.tax.{read,manage}`, `finance.dunning.manage`.
- Errors: `JOURNAL_UNBALANCED`, `FISCAL_PERIOD_CLOSED`, `ACCOUNT_NOT_FOUND`, `JOURNAL_NOT_FOUND`, `JOURNAL_ALREADY_REVERSED`, `WALLET_INSUFFICIENT`, `AR_NOT_FOUND`.

---

## 36. Finance: Expense

### 36.1 Purpose & boundary
General business expenses (rent, utilities, fees, ad-hoc) recorded directly without going through procurement. Posts to GL on approval.

### 36.2 Source layout
```
modules/admin/operations/finance/expense/
├─ entities/
├─ dto/
├─ expense.controller.ts  expense.service.ts  expense.repository.ts
└─ expense.module.ts
```

### 36.3 Routes
- `POST /expenses` — create draft.
- `POST /expenses/:id/approve` — approve and post journal.
- `GET /expenses` — list with filter.

### 36.4 Service
```typescript
class ExpenseService {
  create(ctx, input): Promise<Expense>                       // status DRAFT
  approve(ctx, expenseId): Promise<Expense>
  // workflow on approve: insert into accounting_outbox → DR Expense Account / CR Cash
  //                      → emit expense.created
}
```

### 36.5 Permissions & errors
- `finance.expense.create`, `finance.expense.approve`.
- Errors: `EXPENSE_NOT_FOUND`, `EXPENSE_ALREADY_APPROVED`.

---

## 37. Finance: Invoice (sales invoices)

### 37.1 Purpose & boundary
Customer-facing sales invoices (PDF + tracking + AR-impact). Generated from orders (especially B2B credit sales) and from manual entry.

### 37.2 Source layout
```
modules/admin/operations/finance/invoice/
├─ entities/
├─ dto/
├─ invoice.controller.ts  invoice.service.ts  invoice.repository.ts
└─ invoice.module.ts
```

### 37.3 Service
```typescript
class InvoiceService {
  createForOrder(ctx, orderId, manager): Promise<Invoice>
  recordPayment(ctx, invoiceId, payment): Promise<void>    // appends ar_ledger
  generatePdf(invoiceId): Promise<string>                  // S3 URL, async via report-queue
}
```

### 37.4 Events
- Emits `invoice.created`, `invoice.paid`, `invoice.overdue`.

### 37.5 Errors
`INVOICE_NOT_FOUND`, `INVOICE_ALREADY_PAID`, `INVOICE_OVERPAYMENT`.

---

## 38. Finance: Report

### 38.1 Purpose & boundary
Heavy financial reports (P&L, BS, Cash Flow), operational reports (sales by branch, top customers, low stock), and tax filings. Read from materialized views and ledger aggregates on the read replica.

### 38.2 Source layout
```
modules/admin/operations/finance/report/
├─ controllers/      (report.controller)
├─ services/
└─ report.module.ts
```

### 38.3 Routes
- `GET /report/pl?from=…&to=…&branchId=…`
- `GET /report/balance-sheet?asOf=…`
- `GET /report/cash-flow?from=…&to=…`
- `GET /report/sales-by-branch?from=…&to=…`
- `GET /report/top-customers?from=…&to=…&limit=…`
- `POST /report/export` — enqueue async PDF/Excel build.

### 38.4 Service
Delegates to `FinancialReportService` (in accounting) for finance reports; defines its own queries for operational reports.

### 38.5 Caching
Read responses cached at `t:{tenantId}:reports:pl:{from}:{to}` with 10-min TTL. Cache is **not** invalidated on every ledger write — it expires naturally.

### 38.6 Permissions & errors
- `finance.report.{pl,bs,cf,operational}`.
- Errors: `REPORT_PARAMS_INVALID`, `EXPORT_JOB_FAILED`.

---

## 39. CRM: Customer / Subscriber

### 39.1 Purpose & boundary
Customer master + email subscribers (newsletter). The customer is the user with `userRole === USER`; this module adds the CRM-side view (segments, communication preferences, credit-limit, lifetime value).

### 39.2 Source layout
```
modules/admin/customer/
├─ customer.controller.ts  customer.module.ts
├─ subscriber/             (subscriber.controller, subscriber.service, ...)
└─ lead/                   (see §40)
```

### 39.3 Routes
- `GET /customer` — list with filter (search, segment, branch).
- `GET /customer/:id` — 360 view (orders, balance, wallet, loyalty, returns).
- `PATCH /customer/:id/credit-limit` — set credit limit (audited).
- `GET /subscribers` — newsletter list.
- `POST /subscribers/unsubscribe` — public, token-based.

### 39.4 Service
```typescript
class CustomerService {
  list(ctx, filter): Promise<Customer[]>
  view360(ctx, customerId): Promise<Customer360>
  // joins: profile + orders count + AR balance + wallet balance + loyalty points
  //        + recent activity + addresses + preferred branch
  setCreditLimit(ctx, customerId, limit, reason): Promise<void>      // audited
}
```

### 39.5 Events
- Emits `customer.credit.exceeded` when an order would breach the limit.

### 39.6 Permissions & errors
- `crm.customer.{read,manage}`, `crm.credit_limit.approve`.
- Errors: `CUSTOMER_NOT_FOUND`, `CREDIT_LIMIT_EXCEEDED`.

---

## 40. CRM: Lead

### 40.1 Purpose & boundary
Sales lead pipeline (NEW → CONTACTED → QUALIFIED → WON / LOST). Optional — gated by subscription feature.

### 40.2 Source layout
```
modules/admin/customer/lead/
├─ entities/         (lead.entity)
├─ dto/
├─ lead.controller.ts  lead.service.ts  lead.repository.ts
└─ lead.module.ts
```

### 40.3 Service
```typescript
class LeadService {
  create / update / transition(ctx, leadId, toStage)
  convertToCustomer(ctx, leadId): Promise<{ customerId, orderId? }>
}
```

### 40.4 Subscription gate & errors
- `subscription.features.crm.leads` must be enabled.
- Errors: `LEAD_NOT_FOUND`, `LEAD_INVALID_TRANSITION`, `FEATURE_NOT_ENABLED`.

---

## 41. Marketing: Campaign

### 41.1 Purpose & boundary
Outbound multi-channel marketing (email, SMS, push). Targets segments computed from customer attributes + behavior. Asynchronous dispatch.

### 41.2 Source layout
```
modules/admin/marketing/campaign/
├─ entities/        (campaign, campaign-target, campaign-delivery)
├─ controllers/
├─ services/
├─ repositories/
├─ enums/
├─ queue/           (campaign-queue processor)
└─ campaign.module.ts
```

### 41.3 Service
```typescript
class CampaignService {
  create(ctx, input): Promise<Campaign>         // DRAFT
  schedule(ctx, campaignId, at?): Promise<void> // enqueue dispatch-campaign job
  evaluateSegment(ctx, segmentDef): Promise<UserId[]>
  recordDelivery(campaignId, userId, channel, status): Promise<void>
}
```

### 41.4 Events
- Emits `campaign.dispatched`, `campaign.delivery.failed`.

### 41.5 Subscription gate
`subscription.features.marketing.campaigns`.

### 41.6 Permissions & errors
- `marketing.campaign.{read,manage,send}`.
- Errors: `CAMPAIGN_NOT_FOUND`, `CAMPAIGN_ALREADY_DISPATCHED`, `SEGMENT_EMPTY`.

---

## 42. Marketing: Loyalty / Referral

### 42.1 Purpose & boundary
Customer loyalty point program: earn on orders, spend at checkout, expire after N months. Referral programs: invite-friend bonuses.

### 42.2 Source layout
```
modules/admin/marketing/loyalty/
├─ controllers/
├─ entities/        (loyalty-program, loyalty-tier, loyalty-ledger, referral)
├─ services/        (loyalty.service, referral.service)
├─ queue/           (loyalty-queue)
└─ loyalty.module.ts
```

### 42.3 Entities owned
- `loyalty_programs` — `id`, `tenant_id`, `name`, `accrual_rate`, `redemption_rate`, `is_active`.
- `loyalty_tiers` — bronze/silver/gold with thresholds.
- `loyalty_ledger` — append-only: `user_id`, `txn_type` (EARN | REDEEM | EXPIRY | ADJUSTMENT), `points` (±), `reference_type`, `reference_id`, `expires_at?`.
- `referrals` — `inviter_user_id`, `invitee_email`, `code`, `status` (PENDING | JOINED | REWARDED).

### 42.4 Service
```typescript
class LoyaltyService {
  accrue(ctx, userId, orderId, points, manager): Promise<void>
  redeem(ctx, userId, points, orderId, manager): Promise<void>     // locked + balance-checked
  balance(ctx, userId): Promise<number>
}
class ReferralService {
  generateCode(ctx, userId): Promise<string>
  registerReferralUse(ctx, code, newUserId): Promise<void>
  reward(ctx, referralId): Promise<void>                            // wallet credit + loyalty bonus
}
```

### 42.5 Subscription gate
`subscription.features.marketing.loyalty`.

### 42.6 Permissions & errors
- `marketing.loyalty.{read,adjust}`.
- Errors: `LOYALTY_INSUFFICIENT`, `LOYALTY_PROGRAM_INACTIVE`, `REFERRAL_CODE_INVALID`, `REFERRAL_ALREADY_USED`.

---

## 43. Content: Page / FAQ / Site Settings

### 43.1 Purpose & boundary
CMS-style page builder for storefront, FAQ collection, and tenant-wide site settings (theme, logo, social links, SEO defaults).

### 43.2 Source layout
```
modules/admin/content/
├─ page/         (page.controller, page.service, entities)
├─ faq/          (faq.controller, faq.service, entities)
└─ content.module.ts

modules/admin/settings/
├─ entities/        (site-settings.entity)
├─ dto/
├─ settings.controller.ts  settings.service.ts  site-settings.repository.ts
└─ settings.module.ts
```

### 43.3 Routes
- `GET/POST/PATCH /pages` — page builder pages with blocks (JSONB).
- `GET/POST/PATCH /faqs`.
- `GET /settings` — cached, public-safe subset for storefront.
- `PATCH /settings` — admin update.

### 43.4 Service
Standard CRUD + cache invalidation on settings change.

### 43.5 Subscription gate
- `subscription.features.content.page_builder` for page builder.

### 43.6 Permissions & errors
- `content.page.{read,manage}`, `content.faq.{read,manage}`, `settings.read`, `settings.manage`.

---

## 44. HRM (Employee · Attendance · Leave · Payroll · Recruitment)

### 44.1 Purpose & boundary
The Human Resources module. Currently mounted as a single `hrm.module.ts` with one controller; underlying entities cover the full HR lifecycle.

### 44.2 Source layout
```
modules/admin/operations/hrm/
├─ entities/  (employee, employee-personal-details, employee-document,
│              department, designation, shift, attendance, attendance-event,
│              leave, payroll, performance, recruitment)
├─ dto/
├─ hrm.controller.ts  hrm.service.ts  hrm.repository.ts
└─ hrm.module.ts
```

### 44.3 Entities owned
- `employees` — `id`, `tenant_id`, `user_id?` (links to a portal-login user), `employee_code` (unique per tenant), `department_id`, `designation_id`, `branch_id?`, `joining_date`, `salary_base`, `status` (ACTIVE | ON_LEAVE | INACTIVE | TERMINATED).
- `employee_personal_details`, `employee_documents` — sensitive PII split off (stricter permission).
- `departments`, `designations`, `shifts`.
- `attendance`, `attendance_events` — daily attendance + raw punch events (GPS / geofence in code).
- `leave` — leave requests with quotas + approval workflow.
- `payroll` — payroll batches + slips + components.
- `performance` — review cycles.
- `recruitment` — job postings + applications.

### 44.4 Routes (single controller exposes nested resources)
| Route prefix | Permission |
| --- | --- |
| `POST /operations/hrm/employees` | `hrm.employee.manage` |
| `POST /operations/hrm/attendance/punch` | `hrm.attendance.punch` (employee) |
| `POST /operations/hrm/attendance/correction` | `hrm.attendance.correct` |
| `POST /operations/hrm/leave` | `hrm.leave.request` |
| `POST /operations/hrm/leave/:id/approve` | `hrm.leave.approve` |
| `POST /operations/hrm/payroll/batch` | `hrm.payroll.process` |
| `POST /operations/hrm/payroll/batch/:id/approve` | `hrm.payroll.approve` |
| `POST /operations/hrm/payroll/batch/:id/pay` | `hrm.payroll.pay` |
| `GET /operations/hrm/recruitment/jobs` | `hrm.recruitment.read` |

### 44.5 Public services (within `HrmService` and helpers)
```typescript
class HrmService {
  // Employee
  hire(ctx, input): Promise<Employee>
  terminate(ctx, employeeId, lastDay): Promise<void>

  // Attendance
  punch(ctx, employeeId, type: 'IN' | 'OUT', geo?): Promise<AttendanceEvent>
  correctAttendance(ctx, eventId, input, approverNote): Promise<void>

  // Leave
  requestLeave(ctx, input): Promise<Leave>
  approveLeave(ctx, leaveId, decision): Promise<void>

  // Payroll
  createBatch(ctx, period): Promise<PayrollBatch>          // computes slips
  approveBatch(ctx, batchId): Promise<PayrollBatch>
  // workflow on approve: post journal DR Salary Expense / CR Salary Payable (via outbox)
  payBatch(ctx, batchId): Promise<PayrollBatch>
  // workflow on pay: DR Salary Payable / CR Cash; emit payroll.payment.released
}
```

### 44.6 Invariants
- One open shift per employee (mirrors POS one-open-shift rule for clock-in).
- Payroll batch approval is idempotent — second call returns existing batch state.
- Approved payroll posts exactly one journal (`accounting_outbox` row keyed by `payroll:{batchId}`).

### 44.7 Events
- Emits `employee.hired`, `employee.terminated`, `leave.approved`, `payroll.batch.approved`, `payroll.payment.released`.

### 44.8 Subscription gate
- Whole HRM module is feature-gated on `subscription.features.hrm`.

### 44.9 Permissions & errors
- See routes table.
- Errors: `EMPLOYEE_NOT_FOUND`, `LEAVE_QUOTA_EXCEEDED`, `PAYROLL_ALREADY_APPROVED`, `PAYROLL_NOT_APPROVED`, `ATTENDANCE_GEOFENCE_FAILED`, `BATCH_HAS_OPEN_LEAVES`.

---

## 45. Store: Cart / Wishlist / Wallet / Shipping Address

### 45.1 Purpose & boundary
Storefront-facing variants of cart, wishlist, wallet (read), and shipping addresses. Same tenants/users as admin, but routed under `/store/*` and called by Next.js storefront.

### 45.2 Source layout
```
modules/store/
├─ cart/                (cart.controller, cart.service, entities, dto)
├─ wallet/              (store-wallet.controller — read-only wallet API for storefront)
├─ wishlist/            (wishlist.controller, .service, entities)
└─ shipping-address/    (shipping-address.controller, .service, entities)
```

### 45.3 Routes
- `GET/POST/PATCH /store/cart`
- `GET/POST /store/wishlist`
- `GET/POST/PATCH /store/shipping-addresses`
- `GET /store/wallet` — balance + ledger entries for current customer.

### 45.4 Services
Standard CRUD scoped to `ctx.userId` (customer self). Wallet routes are read-only externally — credits/debits happen only via Sales/Finance flows.

### 45.5 Permissions & errors
- All require `userRole === USER`.
- Errors: `ADDRESS_NOT_FOUND`, `WISHLIST_ITEM_NOT_FOUND`, `CART_LIMIT_EXCEEDED` (max items per cart from subscription).

---

## 46. Infra: Cache / Queue / File / Mail / Notification / Chat / Push / SMS

### 46.1 Purpose & boundary
Cross-cutting infrastructure services that other modules depend on. All are tenant-aware.

### 46.2 Source layout
```
modules/admin/operations/infra/
├─ cache/              (cache.service — wraps cache-manager + Redis)
├─ queue/              (queue.module — registers BullMQ queues)
├─ file/               (controllers, services, S3 client adapter)
├─ mail/               (mail.service — templates + send via SES/SMTP)
├─ notification/       (in-app notification controller + service)
├─ chat/               (chat.controller — Socket.IO gateway adapter)
├─ push/               (push.controller — FCM)
├─ sms/                (sms.service — gateway adapter)
└─ infra.module.ts
```

### 46.3 Cache service
```typescript
class CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, val: T, ttlSec?): Promise<void>
  del(...keys: string[]): Promise<void>
  invalidateTenant(tenantId, ...suffixes): Promise<void>
}
```
Keys MUST follow `t:{tenantId}:...` convention (see §7).

### 46.4 File service
- Uploads go to S3-compatible storage at path `t/{tenantId}/{module}/{yyyy}/{mm}/{uuid}.{ext}`.
- Returns pre-signed URLs valid for 15 min.
- Virus-scan hook (configurable; off by default in dev).
- Max upload size enforced by subscription tier.

### 46.5 Mail / SMS / Push
- All take a `templateId` + variables + tenant-from configuration.
- Backed by their respective queues (`email-queue`, `sms-queue`, `push-queue`).
- Failed deliveries log to `notifications` table with retry counter.

### 46.6 Chat
- Real-time tenant support chat over Socket.IO.
- Rooms keyed by `t:{tenantId}:conversation:{id}`.
- Auth via JWT (same as REST).

### 46.7 Notification
- In-app notifications stored in `notifications` table.
- `GET /infra/notifications` for the current user, paginated.
- Mark-as-read endpoint.

### 46.8 Subscription gate
- File storage size is metered (`subscription.caps.storage_mb`).
- Email volume metered (`subscription.caps.emails_per_month`).
- SMS metered separately.

---

# Part III — Acceptance for any new LLD entry

## 47. Author's Checklist for LLD Updates

When you add a new module or a major feature, append a section to Part II using this checklist. **A new section is not complete until every item is filled in.**

1. **Purpose & boundary** — what does this module own vs. delegate?
2. **Source layout** — paste the actual `tree` output of `server/src/modules/.../<module>`.
3. **Entities owned** — list every entity with its key columns and any unique indexes.
4. **Controllers & routes** — table of HTTP routes with the permission decorator on each.
5. **Public services** — TypeScript snippet of the public service interface(s).
6. **Key DTOs** — at least the create/update DTO shapes.
7. **Events emitted / consumed** — wire the module into the canonical event map in §4.4.
8. **Transactions, locks, idempotency** — list every workflow that spans more than one table or external call, with its transaction shape and idempotency keys.
9. **Subscription gate, permissions, errors** — explicit list, mapped to §10.2 error codes.

PRs that add new modules without an LLD section MUST be rejected.

---

*This LLD is a living document. Update it whenever a module's contract changes — never leave stale module sections that contradict the code.*
