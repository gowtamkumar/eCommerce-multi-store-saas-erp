# ERP Project Assessment

> Senior engineering review of the `eCommerce-multi-tenant-saas` repository.
> Source of evidence: documentation under `doc/erp`, backend modules under `server/src/modules`, and admin UI under `client/`.
> Date: 2026-05-20

---

## 1. Executive Summary

This repository is **no longer just an eCommerce SaaS** — it already contains a multi-tenant ERP direction with real backend and frontend implementation across inventory, procurement, finance, POS, fulfillment, HRM, organization, and RBAC.

However, it is **not yet a complete ERP**. The strongest work is module scaffolding and basic CRUD/workflow surfaces. The weakest parts are cross-module business guarantees (stock reservation, offline POS, accounting completeness, production-grade procurement and HR controls).

| Metric | Count |
| :--- | :--- |
| ERP areas reviewed | 10 |
| Mostly implemented | 2 |
| Partially implemented | 6 |
| Mostly missing / prototype | 2 |

---

## 2. What the ERP Currently Has

### 2.1 Documentation (Intent)
Docs under `doc/erp/` describe a full multi-tenant ERP/POS target:

- Multi-tenant boundaries: tenant, branch, warehouse, catalog, inventory, commerce, fulfillment, procurement, accounting, CRM, HRM, analytics, platform
- Inventory/WMS: immutable inventory ledger, warehouse scope, bins, reservations, transfers, adjustments, low-stock alerts, batch/expiry
- Procurement/SCM: suppliers, PR, RFQ, PO, GRN, AP, debit notes, 3-way matching
- Finance/accounting: COA, double-entry journals, P&L, balance sheet, AP/AR, tax, fiscal closing, branch reporting dimensions
- POS/retail: register, shift, offline sync, barcode scanning, multi-payment, receipts, returns/exchanges, cashier permissions
- HRM/team/RBAC: users vs employees, branch-scoped access, employees, attendance, leave, payroll, recruitment, dynamic permissions

### 2.2 Backend Implementation
NestJS modules wired through `OperationsModule` and `AppModule`:

- **Organization** — branch and warehouse CRUD, warehouse bins (`server/src/modules/system/organization`)
- **Inventory ledger** — immutable-style ledger API, stock summary, low-stock/out-of-stock notifications, FIFO COGS hooks, accounting posting (`server/src/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service.ts`)
- **Procurement** — supplier CRUD, PO CRUD/status/payment, GRN creation/verification, AP supplier ledger (`server/src/modules/admin/operations/finance/purchase`, `.../logistics/grn`, `.../finance/supplier`)
- **Accounting** — COA initialization, balanced journal creation, inventory purchase/COGS postings, P&L and balance sheet endpoints (`server/src/modules/admin/operations/finance/accounting`)
- **POS** — registers, shift open/close, POS sale sync, sales journal, inventory deduction (`server/src/modules/admin/sales/pos`)
- **Fulfillment** — create tasks from confirmed orders, pick/pack/ship flow, SALE ledger posting on shipment (`server/src/modules/admin/operations/logistics/fulfillment`)
- **HRM** — departments, designations, employees, shifts, attendance, leave, payroll, recruitment, performance review APIs (`server/src/modules/admin/operations/hrm`)
- **RBAC / feature gating** — permissions guard, branch scope guard, `@RequirePermissions`, route feature gating (`server/src/modules/admin/core/rbac`)

### 2.3 Frontend Implementation
Substantial admin ERP surfaces under `client/`:

- Navigation exposes Procurement, HRM, Operations, Finance, POS, Fulfillment, Reports, Access Control (`client/routes.ts`)
- ERP pages exist for procurement, GRN, suppliers/AP ledger, purchase orders, HRM, payroll, attendance, leaves, recruitment, inventory, warehouses/branches, fulfillment, POS, finance reports (`client/app/admin`)
- API service clients exist for procurement, HRM, accounting, organization (`client/services/*.ts`)
- POS UI: shift open/close, product search, cart, customer lookup, coupon validation, delivery zone, receipt print, sale sync (`client/features/admin/pos/components/Pos.tsx`)
- Inventory UI: stock dashboard, transaction history, warehouse filter, stock adjustment modal (`client/features/admin/inventory`)
- Finance UI: dashboard, P&L, balance sheet, and a "General Ledger" page (currently reads inventory ledger entries) (`client/features/admin/finance`)

---

## 3. Module Coverage Matrix

| Area | What Exists | Status | Assessment |
| :--- | :--- | :--- | :--- |
| **Organization** | Branches, warehouses, warehouse bins | Mostly implemented | Backend organization module and admin settings UI exist. |
| **Inventory / WMS** | Ledger, stock summary, low-stock alerts, adjustments | Partial | Ledger and stock views exist; transfers, reservations, batch/expiry, and cycle counts are not complete. |
| **Procurement** | Suppliers, purchase orders, GRN, AP ledger | Partial | PO, GRN, supplier, AP slices exist; PR/RFQ/3-way matching/debit-note workflows are incomplete. |
| **Finance** | COA, journals, P&L, balance sheet, expenses | Partial | Core reporting exists; posting coverage is narrow and tax/AP/AR/reversal depth is missing. |
| **POS / Retail** | Register, shifts, cart, sale sync, receipt | Partial | Usable online POS exists; true offline-first sync is not implemented. |
| **Fulfillment** | Pick, pack, ship, shipment stock deduction | Partial | Task flow exists; reservation/sourcing and split-shipment depth are missing. |
| **HRM** | Employees, attendance, leave, payroll, recruitment | Prototype + partial production | Broad API/UI exists, but payroll/performance/demo/schema-repair areas need hardening. |
| **RBAC / Access** | Dynamic roles, permissions, branch scope | Mostly implemented | Guards/decorators and access UI exist; needs full permission audit as features mature. |
| **CRM / Loyalty** | Credit limits, rewards, segmentation | Mostly missing | Docs mention it, but ERP-grade workflows are not meaningfully present. |
| **BI / Reporting** | Dashboards, reports, export center | Partial | Several dashboards/reports exist; automated ERP reporting is still limited. |

---

## 4. Incomplete / Stubbed / Missing Areas

Evidence-based gaps observed in code:

- **Purchase requisitions are UI-local only** — `RequisitionBoard` keeps PRs in React state and only fetches departments. No backend PR workflow is wired. (`client/features/admin/procurement/components/RequisitionBoard.tsx`)
- **RFQ / quotation / debit-note entities exist** but full controller/UI workflows comparable to PO/GRN are missing. (`server/src/modules/admin/operations/finance/purchase/entities`)
- **Accounting integration only handles purchase and sale COGS**; adjustments, returns, damage, transfers, tax, AP payment journals, AR, and reversals are not fully posted. (`server/src/modules/admin/operations/finance/accounting/services/accounting-integration.service.ts`)
- **POS is online sync UI, not true offline-first** (no IndexedDB queue / background sync as designed). (`doc/erp/POS-Retail-Design.md`, `client/features/admin/pos/components/Pos.tsx`)
- **Stock reservations / sourcing are incomplete** — docs require ATP, reservations, warehouse sourcing, split shipments; code has fulfillment and ledger movements but no first-class reservation/sourcing engine. (`server/src/modules/admin/sales/order/services/order.service.ts`)
- **Transfers, batch/expiry, barcode label generation, stock audits/cycle counts** are documented but not surfaced as complete workflows.
- **HRM has explicit demo/schema-repair code**, placeholder performance aggregation, hardcoded onboarding password, and simplified payroll calculations. (`server/src/modules/admin/operations/hrm/hrm.service.ts`)
- **One backend repository method is explicitly unimplemented**: `throw new Error('Method not implemented.')` in `server/src/modules/admin/sales/order/repositoris/order.repository.ts`.
- **No ERP-specific seed/migration scripts** — only standard TypeORM/Jest/Next scripts in `package.json`.

---

## 5. Recommended Implementation Order

Priority list for turning this into a production-grade ERP:

### Priority 1 — Stock Reservations & Warehouse Sourcing
**Why:** Protects order-to-cash integrity and connects orders, inventory, fulfillment, POS, and accounting. Without this, parallel sales can oversell stock.
**Touchpoints:** Order service, inventory ledger, fulfillment, POS, accounting events.

### Priority 2 — Full Procurement Lifecycle
**Why:** Turns buying from PO/GRN screens into a controlled business process.
**Build:** Persistent PR approval workflow → RFQ → PO → GRN → supplier invoice → debit note → 3-way matching → AP.

### Priority 3 — Complete Accounting Event Coverage
**Why:** Makes ERP reports auditable rather than partially derived.
**Build:** Journal posting for returns, adjustments, damage, transfers, AP payments, tax liability/input, AR, reversals. Enforce immutable posted journals.

### Priority 4 — WMS Maturity
**Why:** Real warehouses need transfers, traceability, and physical reconciliation.
**Build:** Stock transfers (with in-transit), batch/expiry tracking, barcode/label printing, cycle counts, stock audits.

### Priority 5 — Offline-First POS
**Why:** Retail stores cannot stop selling when the internet goes down.
**Build:** IndexedDB sale queue, background sync, conflict handling, product/price cache, reliable receipt/order numbering, service worker.

### Priority 6 — Harden HRM & Payroll
**Why:** Move from prototype to production.
**Build:** Remove schema-repair/demo endpoints from production path, replace placeholder performance metrics, calculate payroll from attendance/leave/overtime, replace hardcoded onboarding credentials with secure flow.

### Priority 7 — CRM, Loyalty, Credit Limits & AR Aging
**Why:** Improves retention and unlocks B2B/wholesale once core controls are stable.
**Build:** Customer credit limits, points/rewards engine, customer segmentation, AR aging buckets, dunning.

---

## 6. Engineering Notes & Risks

- **Tech stack** — NestJS 11 + TypeORM 0.3 on the server; Next.js 16 + React 19 + Tailwind 4 on the client. Redis (BullMQ + cache-manager), Socket.IO, web-push are wired.
- **No Prisma** despite some docs referencing schemas — the project uses TypeORM migrations (`server/src/database/migrations`).
- **Multi-tenant context** — request context (`tenantId`, `branchId`) flows through services; ensure every new ERP write enforces this in repositories.
- **Event-driven foundations** — `doc/event-driven-architecture.md` exists; reservations and accounting postings are good candidates for the event bus rather than direct service calls.
- **Caching strategy** — see `doc/api-caching-strategy.md`. Make sure new ERP read endpoints (stock-on-hand, AP balances) follow it to keep dashboards fast.
- **Audit logging** — `doc/audit-log.md` plus an audit-logs admin page exist. All new ERP mutations (journals, reservations, PRs, transfers) should emit audit events.

---

## 7. Quick Status Snapshot

```
Implemented well   ██░░░░░░░░  Organization, RBAC
Implemented partly ██████░░░░  Inventory, Procurement, Finance, POS, Fulfillment, HRM, BI
Missing / stub     ██░░░░░░░░  CRM/Loyalty, Stock reservations, Offline POS, Full procurement/accounting depth
```

---

## 8. Deeper Senior Engineering Analysis

### 8.1 Overall Architecture Readiness

The architecture is moving in the right ERP direction:

- The backend is modular and domain-oriented: sales, catalog, finance, logistics, HRM, system/organization, and RBAC are separated.
- The app already uses TypeORM transactions in important areas such as order creation, POS sale sync, PO receiving, fulfillment shipment, and accounting journal creation.
- Tenant scoping exists throughout service calls via `RequestContextDto`.
- There is an inventory ledger and accounting journal model instead of only mutable counters.
- Background queues, notifications, audit logs, cache service, and WebSocket infrastructure already exist.

But the ERP core is not yet fully safe for high-volume business operations:

- Inventory source-of-truth is mixed between ledger-derived values and product/variant stock caches.
- Reservation lifecycle is not cleanly separated from physical stock movement.
- Accounting posting is not event-complete.
- Some ERP concepts exist as entities but not as workflows.
- Some UI screens look production-grade visually but are still local-state or fallback/mock behavior.
- Cross-module invariants are not consistently enforced.

### 8.2 ERP Maturity Score

| Capability | Score | Meaning |
| :--- | :---: | :--- |
| Multi-tenant foundation | 7/10 | Tenant context is common, but every new ERP write must be audited for tenant/branch/warehouse scope. |
| Organization model | 7/10 | Branch, warehouse, and bins exist; needs stronger operational rules around default warehouse, branch ownership, and transfers. |
| Inventory ledger | 6/10 | Ledger is real and useful, but reservation, transfers, stock audit, batch/expiry, and cache consistency need work. |
| Procurement | 5/10 | PO, GRN, supplier, and AP ledger exist; PR/RFQ/invoice/3-way matching are incomplete. |
| Finance/accounting | 5/10 | COA and double-entry journals exist; coverage is narrow and journal immutability/reversal controls need hardening. |
| POS | 5/10 | Good online cashier flow; offline-first and robust conflict handling are not complete. |
| Fulfillment | 5/10 | Pick/pack/ship flow exists; warehouse sourcing, reservation consumption, split fulfillment, and carrier lifecycle need depth. |
| HRM | 5/10 | Broad feature surface; payroll/performance/onboarding need production rules and removal of demo/schema repair paths. |
| RBAC/access | 7/10 | Strong direction with permissions and branch scope; needs permission coverage tests and high-risk action review. |
| CRM/loyalty/AR | 2/10 | Mostly planned, not ERP-grade implementation yet. |
| Reporting/BI | 4/10 | Dashboards exist, but financial and operational reporting depends on incomplete source events. |

**Approximate ERP readiness:** 50-60% for an internal alpha, 30-40% for production ERP use.

This means the project can demonstrate ERP workflows, but should not yet be trusted as the financial/inventory system of record for a real multi-branch business without the next foundation work.

---

## 9. Module-by-Module Deep Dive

### 9.1 Inventory and Warehouse Management

**What is strong**

- `InventoryLedgerEntity` supports product, variant, tenant, branch, warehouse, bin, supplier, transaction type, quantity, balance after, unit cost, COGS amount, and reference fields.
- `InventoryLedgerService.createLedgerEntry()` centralizes stock movement creation.
- Transaction types already include purchase, sale, transfer in/out, adjustment, return, damage, initial balance, reservation, and reservation cancel.
- Low-stock and out-of-stock notifications exist.
- COGS calculation is triggered for sale movements.

**Main concerns**

- `getStockSummary()` still says product stock is used as a source for phase 2, while ERP docs say ledger should be source of truth and product stock should only be a cache.
- Reservation is represented as a ledger transaction type, but there is no first-class reservation table with expiry, status, warehouse allocation, order line relation, or partial fulfillment state.
- Physical stock movement and reservation movement are mixed in the same ledger semantics. This can make available-to-promise calculations fragile.
- Transfer transaction types exist, but no complete transfer document workflow is visible.
- Batch/expiry, serial numbers, cycle count, and stock audit are not implemented as full workflows.
- No obvious idempotency key on stock movements. POS/offline sync and queues can retry, so duplicate ledger entries are a serious risk.

**Recommended target design**

- Keep immutable `inventory_ledger` for physical movements.
- Add `stock_reservations` for commitments: `tenantId`, `orderId`, `orderItemId`, `productId`, `variantId`, `warehouseId`, `reservedQty`, `releasedQty`, `fulfilledQty`, `status`, `expiresAt`.
- Add stock transfer documents: `stock_transfers`, `stock_transfer_items`, statuses `DRAFT`, `APPROVED`, `IN_TRANSIT`, `RECEIVED`, `CANCELLED`.
- Add stock count documents: `cycle_counts`, `cycle_count_items`, variance approval, then adjustment ledger posting.
- Add batch/expiry fields either on inventory lots or ledger lot lines.

### 9.2 Order, Reservation, Fulfillment

**What is strong**

- Order creation is transactional.
- `OrderProcessHelper.processItem()` locks product/variant rows pessimistically before checking stock.
- Fulfillment tasks support pending, picking, packed, and shipped flow.
- Shipping posts a SALE inventory movement.

**Main concerns**

- Order creation currently creates `RESERVATION` ledger entries, then fulfillment shipping creates `SALE` ledger entries. Without a clear reservation consumption step, available stock and on-hand stock can become confusing.
- `OrderService.createOrder()` updates inventory ledger rows with `referenceId: null` to attach them to the saved order. That pattern can accidentally affect unrelated rows if multiple reservation entries are created in the same tenant/transaction shape.
- Fulfillment chooses the first active warehouse as default. That is not enough for ERP-grade sourcing.
- There is no split fulfillment engine for multi-warehouse orders.
- No clear backorder policy, allocation priority, partial shipment handling, or reservation expiry job.
- One order repository method is explicitly unimplemented.

**Recommended target design**

- Order placement should reserve stock, not physically sell stock.
- Fulfillment shipment should consume reservation and create physical SALE movement.
- Warehouse sourcing should choose a warehouse based on available stock, branch, shipping zone, priority, or nearest location.
- Add explicit statuses: `ALLOCATED`, `PARTIALLY_ALLOCATED`, `BACKORDERED`, `PICKING`, `PARTIALLY_SHIPPED`, `SHIPPED`.
- Use idempotency keys for order creation, POS sync, reservation, and shipment events.

### 9.3 Procurement and Supply Chain

**What is strong**

- Supplier CRUD exists.
- Purchase order creation/list/detail/status update exists.
- PO receiving can auto-create GRN.
- GRN creation and verification endpoints exist.
- Supplier AP ledger exists.
- Supplier payment recording endpoint exists.

**Main concerns**

- Purchase requisition UI is local React state only. It does not persist PRs.
- PR/RFQ/quotation/debit note entities exist, but workflow controllers/services are missing or incomplete.
- `client/services/procurement.ts` only exposes suppliers, purchase order creation, and GRN processing. That shows the UI integration is much shallower than the documented procurement lifecycle.
- PO receiving dispatches stock update jobs. If the job fails after GRN/AP changes commit, inventory and AP can diverge unless there is retry/idempotency/reconciliation.
- 3-way matching is not implemented as a first-class control: PO vs GRN vs supplier invoice.
- Purchase approval rules are not obvious: thresholds, department budget, approver role, branch/warehouse permissions.

**Recommended target design**

- Persist PR: requestor, department, item lines, budget code, required date, approval chain.
- RFQ workflow: create RFQ from PR, invite suppliers, compare quotations, select supplier.
- Supplier invoice workflow: match invoice lines against PO and GRN.
- 3-way matching statuses: `MATCHED`, `PRICE_VARIANCE`, `QTY_VARIANCE`, `OVER_BILLED`, `APPROVAL_REQUIRED`.
- AP should be driven by supplier invoices, not only GRN/PO status.
- Payments should post accounting journals and reduce AP.

### 9.4 Finance and Accounting

**What is strong**

- Default chart of accounts exists.
- `AccountingService.createJournalEntry()` enforces debit equals credit.
- Account balances are updated when journal lines are created.
- P&L and balance sheet report endpoints exist.
- Inventory purchases and sale COGS have accounting integration.
- POS revenue journal is created during sync.
- Payroll creates a salaries payable journal.

**Main concerns**

- `AccountingIntegrationService.postInventoryMovement()` only handles `PURCHASE` and `SALE`.
- The code comment explicitly says more cases should be added for adjustment, return, etc.
- Accounting posting failures are caught and logged without forcing the parent business transaction to fail. That can create operational success with financial failure.
- There is no visible `posted/unposted` reconciliation queue for failed accounting events.
- Journal immutability is not clear: posted financial records should not be edited after posting. Corrections should use reversals.
- Tax/VAT accounting is not complete.
- AR is not mature: customer ledger endpoint exists in report controller, but customer credit limit, receivables posting, aging, and collections are not full workflows.
- Expense tracking exists, but the relationship between expenses, journals, approvals, attachments, and payments needs review.

**Recommended target design**

- Move toward an accounting event map:
  - `PO_RECEIVED` -> inventory asset / GRN clearing or AP accrual
  - `SUPPLIER_INVOICE_POSTED` -> AP liability
  - `SUPPLIER_PAYMENT` -> AP debit / cash credit
  - `ORDER_PAID` -> cash or receivable debit / revenue credit / tax payable credit
  - `ORDER_SHIPPED` -> COGS debit / inventory credit
  - `RETURN_APPROVED` -> sales return / refund payable / inventory return
  - `STOCK_ADJUSTMENT` -> inventory gain/loss
  - `TRANSFER` -> no P&L impact unless valuation or shrinkage occurs
  - `PAYROLL_POSTED` -> salary expense / salary payable
- Add `accounting_events` table or outbox queue with status `PENDING`, `POSTED`, `FAILED`, `RETRYING`.
- Add fiscal periods and period close controls.
- Add reversal journal support.

### 9.5 POS and Retail

**What is strong**

- POS register and shift management exist.
- Cash/card/mobile sales aggregates are tracked by shift.
- Sale sync creates order, order items, inventory SALE movements, and sales revenue journal.
- POS UI is substantial: cart, product search, customer link, coupon, shipping/delivery fields, receipt printing.

**Main concerns**

- Backend calls the endpoint `sync`, but frontend/offline storage does not appear to implement a durable offline queue.
- No confirmed IndexedDB queue, service worker, retry policy, sync status, or conflict resolution.
- No idempotency key on POS sale sync. Offline retry can duplicate orders, stock movements, and journal entries.
- Multi-payment support appears simplified to a single payment method enum in sync.
- Cash reconciliation is basic. Real retail needs cash drawer movements: paid in, paid out, cash drop, safe transfer, variance approval.
- Returns/exchanges are not fully integrated with POS cashier flow and accounting/inventory reversal.

**Recommended target design**

- Add client-side offline sale queue in IndexedDB.
- Every POS sale gets a stable `clientSaleId` generated before sync.
- Backend enforces uniqueness on `tenantId + clientSaleId`.
- Cache product catalog, price book, taxes, active coupons, register config, and customer minimal profile.
- Sync statuses: `LOCAL_ONLY`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`.
- Shift close should block or warn if unsynced sales exist.

### 9.6 HRM and Payroll

**What is strong**

- HRM module is broad: departments, designations, employees, shifts, attendance, leave, payroll, recruitment, performance.
- Audit logging exists on many HR mutations.
- Payroll posts accounting entries.
- Attendance has clock-in/clock-out behavior.

**Main concerns**

- `hrm.service.ts` includes demo data seeding and schema repair logic inside the production service/controller surface.
- Payroll calculation is simplified and does not appear fully derived from attendance, leave, overtime, deductions, tax, benefits, and approvals.
- Performance aggregation is marked as placeholder.
- Onboarding flow needs secure credential handling.
- HRM permissions should be very strict because payroll and employee records are sensitive.

**Recommended target design**

- Move seed/repair functionality into CLI scripts or dev-only admin commands.
- Add payroll components: basic salary, overtime, bonuses, deductions, tax, benefits, loan, advance.
- Add payroll approval workflow before journal posting.
- Add attendance rules by shift, grace period, weekend/holiday calendar, overtime policy.
- Add employee document access controls and audit trails.

### 9.7 RBAC, Tenant Scope, and Audit

**What is strong**

- RBAC and feature gating are present.
- Branch scope guard exists.
- Dynamic role/permission docs are strong.
- Audit logging infrastructure exists.

**Main concerns**

- ERP-sensitive actions need explicit permission coverage, not only route access.
- Branch/warehouse scope must be enforced in every inventory/procurement/fulfillment query.
- User-level overrides should require expiry and reason.
- Permission checks should be tested for high-risk endpoints.

**High-risk permissions to verify**

- Create/approve stock adjustment
- Approve stock transfer
- Receive PO / verify GRN
- Create supplier payment
- Post/reverse journal
- Run payroll
- Close POS shift with cash variance
- Change product cost/price
- Override customer credit limit

---

## 10. End-to-End Workflow Readiness

### 10.1 Order-to-Cash

| Step | Current state | Production gap |
| :--- | :--- | :--- |
| Product/catalog selection | Present | Needs stronger price book and tax integration across POS/eCommerce. |
| Stock availability check | Partial | Needs ATP by warehouse and reservation-aware available stock. |
| Order creation | Present | Reservation reference handling and idempotency need hardening. |
| Payment | Partial | Gateway and COD flow exist, but AR/customer credit is incomplete. |
| Fulfillment | Partial | Needs sourcing, split shipment, reservation consumption. |
| Revenue posting | Partial | POS revenue exists; eCommerce order revenue/tax lifecycle needs verification. |
| COGS posting | Partial | SALE movement posts COGS; must align with shipment and returns. |
| Return/refund | Partial | Return module exists, but inventory/accounting reversal depth is unclear. |

### 10.2 Procure-to-Pay

| Step | Current state | Production gap |
| :--- | :--- | :--- |
| Purchase requisition | UI prototype | Needs persistent backend workflow and approvals. |
| RFQ / quotation | Entity-level | Needs service/controller/UI workflow. |
| Purchase order | Present | Needs approval, budget, supplier terms, and change history. |
| Goods receipt | Present | Needs partial receipt, variance, damaged goods, lot/batch support. |
| Supplier invoice | Missing/partial | Needed for real AP control. |
| 3-way match | Missing | Needed before payment approval. |
| Supplier payment | Partial | Must post cash/AP journal and support partial payments. |

### 10.3 Inventory-to-Finance

| Event | Current state | Production gap |
| :--- | :--- | :--- |
| Purchase receipt | Partial posting | Needs reliable PO/GRN/invoice accounting lifecycle. |
| Sale shipment | Partial posting | Needs reservation consumption and shipment-based COGS. |
| Adjustment | Ledger type exists | Needs approval, reason codes, and accounting posting. |
| Damage/shrinkage | Ledger type exists | Needs write-off journal and approval workflow. |
| Transfer | Ledger type exists | Needs transfer documents and in-transit state. |
| Return | Ledger type exists | Needs refund, restock inspection, and reversal journals. |

---

## 11. Main Technical Risks

| Risk | Severity | Why it matters | Suggested fix |
| :--- | :---: | :--- | :--- |
| Duplicate POS/order sync | Critical | Can duplicate revenue, inventory movement, and journals. | Add idempotency keys and unique constraints. |
| Mixed reservation and physical movement | Critical | Can make stock-on-hand and available stock inaccurate. | Separate reservations from physical inventory ledger. |
| Accounting failures only logged | Critical | Business transaction can succeed while finance is missing. | Add outbox/retry and reconciliation dashboard. |
| Incomplete accounting event map | High | P&L/balance sheet cannot be trusted. | Implement event-driven posting for all ERP events. |
| PO/GRN/AP divergence | High | Supplier liability and stock can go out of sync. | Add supplier invoice and 3-way matching. |
| Cache invalidation gaps | High | ERP users may see stale stock/AP/report data. | Standardize cache keys and invalidate by domain event. |
| Branch/warehouse scope leakage | High | Multi-branch tenants may see or mutate wrong stock. | Add scope tests and repository-level filters. |
| Demo/schema repair in HRM service | Medium | Risky production surface. | Move to dev-only scripts or migrations. |
| Missing workflow tests | Medium | Cross-module regressions likely. | Add integration tests for core ERP flows. |

---

## 12. Suggested Data Model Additions

### Inventory

- `stock_reservations`
- `stock_transfers`
- `stock_transfer_items`
- `inventory_lots`
- `cycle_counts`
- `cycle_count_items`
- `inventory_adjustment_approvals`

### Procurement

- `purchase_requisition_approvals`
- `rfq_suppliers`
- `quotation_items`
- `supplier_invoices`
- `supplier_invoice_items`
- `three_way_match_results`
- `supplier_payment_allocations`

### Accounting

- `accounting_events`
- `journal_reversals`
- `fiscal_periods`
- `tax_codes`
- `tax_jurisdictions`
- `customer_ar_ledger`
- `payment_allocations`

### POS

- `pos_cash_movements`
- `pos_sync_attempts`
- `pos_sale_idempotency_keys`
- `pos_return_sessions`

### HRM

- `payroll_components`
- `payroll_approvals`
- `attendance_policies`
- `holiday_calendars`
- `overtime_rules`

---

## 13. Testing Strategy Needed Before Production

### Backend integration tests

- Create order reserves stock once and cannot oversell.
- Fulfillment shipment consumes reservation and posts SALE ledger exactly once.
- POS sync is idempotent when the same client sale is submitted multiple times.
- PO receive creates GRN, inventory purchase ledger, AP entry, and accounting journal.
- Supplier payment reduces AP and posts cash journal.
- Return approval restocks/refunds/posts reversal entries correctly.
- Payroll processing creates slips and salary payable journal.
- Permission guard blocks unauthorized branch/warehouse mutations.

### Frontend workflow tests

- POS can create a sale, print receipt, and recover from failed sync.
- Purchase requisition persists and moves through approval states.
- GRN verification shows variance and prevents invalid receipt.
- Inventory dashboard reflects ledger movements after adjustment/receipt/sale.
- Finance reports match journal entries, not UI-only calculations.

### Data consistency tests

- Ledger stock equals stock summary for sampled products.
- Account balances equal sum of ledger entries.
- AP supplier ledger equals unpaid supplier invoices/payments.
- Open reservations never exceed on-hand stock by warehouse.
- Closed shifts equal payment totals plus opening cash minus cash movements.

---

## 14. Phased Delivery Roadmap

### Phase 1 - Stabilize ERP Core

Goal: prevent bad stock and duplicate financial records.

- Add idempotency keys to order creation, POS sync, stock movement, shipment, and payment posting.
- Separate stock reservation model from inventory ledger.
- Implement available-to-promise by warehouse.
- Fix unimplemented order repository method.
- Add core integration tests for order, POS, inventory, and accounting.

### Phase 2 - Complete Procure-to-Pay

Goal: make buying stock financially controlled.

- Persist purchase requisitions and approvals.
- Implement RFQ and quotation comparison.
- Add supplier invoice and invoice line matching.
- Implement 3-way matching.
- Ensure supplier payments post accounting journals and reduce AP.

### Phase 3 - Complete Accounting System of Record

Goal: make reports auditable.

- Add accounting event outbox.
- Implement journal posting for returns, adjustments, transfers, damage, tax, AP, AR, and payroll.
- Add reversal journals and fiscal period close.
- Add reconciliation dashboard for failed/unposted events.

### Phase 4 - WMS and Retail Depth

Goal: support real warehouse and store operations.

- Implement stock transfers with in-transit state.
- Add batch/expiry and barcode label support.
- Add cycle counts and stock audit approvals.
- Make POS offline-first with IndexedDB queue and conflict handling.
- Add cash drawer movements and shift variance approvals.

### Phase 5 - Growth Features

Goal: add customer retention and analytics after core accuracy is solved.

- Add customer credit limits and AR aging.
- Add loyalty points and rewards.
- Add customer segmentation.
- Add automated daily/weekly reports.
- Add role-based dashboards for owner, accountant, warehouse manager, cashier, and HR.

---

## 15. Final Senior Engineering Verdict

This project has a strong foundation for a multi-tenant commerce ERP, especially compared with a normal eCommerce admin panel. The team has already made the right architectural moves: modular backend, operations domain, inventory ledger, accounting journals, POS shifts, fulfillment tasks, HRM, and dynamic access control.

The next engineering focus should not be adding more screens. The focus should be **closing business invariants**:

- one sale should reserve stock once;
- one shipment should deduct stock once;
- one business event should post accounting once;
- every purchase should reconcile PO, GRN, invoice, AP, and payment;
- every high-risk ERP action should have permission, audit, and reversal/approval logic.

If those invariants are implemented, this can become a credible ERP. Without them, it will remain a visually rich admin system with ERP-like modules but weak operational guarantees.

---

*This assessment is based on static code and documentation analysis only. The application was not run and tests were not executed.*
