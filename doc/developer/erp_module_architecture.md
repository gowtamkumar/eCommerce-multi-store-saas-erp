# ERP Module Architecture & Data Segregation Strategy

**Author:** Senior Engineering Team  
**Context:** Transformation of the eCommerce platform into a multi-store, multi-branch ERP SaaS.  
**Objective:** Define clear **scope**, **ownership**, and **boundaries** for every module so data stays consistent across Store, Branch, and Warehouse levels.

**Related docs:** [ERP-Ownership-Boundaries.md](./ERP-Ownership-Boundaries.md), [ERP-Architecture.md](./ERP-Architecture.md), [Procurement-SupplyChain-Design.md](./Procurement-SupplyChain-Design.md), [Finance-Accounting-Design.md](./Finance-Accounting-Design.md), [POS-Retail-Design.md](./POS-Retail-Design.md), [ERP-Inventory-Stock-Flow-Guideline.md](./ERP-Inventory-Stock-Flow-Guideline.md), [ERP-Customer-Boundaries.md](./ERP-Customer-Boundaries.md).

---

## 1. The 3-Tier Scoping Model

Every entity and business transaction must declare **one primary scope** (who owns the record) and, where needed, **reference scopes** (who consumes or executes against it).

| Tier | Scope key | What it means |
| :--- | :--- | :--- |
| **Global (Store)** | `storeId` only | Master data and consolidated functions shared by the whole organization. |
| **Branch** | `storeId` + `branchId` | Revenue, POS, and branch-level operations tied to a store or office. |
| **Warehouse** | `storeId` + `warehouseId` | Physical stock, receiving, picking, and logistics tied to a storage location. |

**Relationship rules**

- A **Branch** may link to one or more **Warehouses**; a **Warehouse** may serve one or more **Branches** (many-to-many via configuration, not via shared ownership of stock).
- **Branches do not own stock.** Quantities live only in **Warehouse** scope (`Inventory Ledger`, bins, GRN). A retail “back room” is modeled as a **warehouse** (or stock location) linked to that branch.
- **Accounting is always Store-global.** Branch P&L is derived from **reporting dimensions** on journal lines (`branchId` metadata), not from duplicating COA or ledger tables per branch.

---

## 2. Canonical Scope Rules (Read First)

Use these rules before assigning a module to a tier.

1. **One primary owner per entity** — If two tiers seem to “own” the same row, split the entity (e.g. PO header vs GRN) or mark one tier as **reference only**.
2. **Master data is Store-global** — Product definition, supplier master, customer master, COA, branches/warehouses as *definitions*.
3. **Money posts once, globally** — `Journal Entry` / `Ledger Entry` are Store scope; optional `branchId` on **lines** is for allocation/reporting only.
4. **Stock moves only in Warehouse scope** — Any increase/decrease of on-hand quantity goes through `Inventory Ledger` with mandatory `warehouseId`.
5. **Sales revenue belongs to Branch** — Orders/POS that represent a sale must record `branchId` (or be explicitly unassigned until routed, then updated).
6. **Procurement is split** — **Who buys** (PO approval, supplier terms) is Store; **what arrived where** (GRN, dock operations) is Warehouse.
7. **Cross-scope handoffs are events, not shared tables** — e.g. GRN confirmed → inventory ledger (Warehouse) → journal entry (Store). See §6.
8. **SaaS isolation is absolute** — No row may be read or written across `storeId` values; branch/warehouse rules apply only *inside* a store.
9. **Immutable audit domains** — Posted journal entries, inventory ledger rows, and compliance audit logs are append-only (reversal/adjustment documents, never silent UPDATE/DELETE).

**Forbidden patterns**

| Do not | Why |
| :--- | :--- |
| Put `branchId` on COA or core account master rows | Breaks consolidated books |
| Treat `branchId` on inventory ledger as “branch owns stock” | Stock owner is always the warehouse |
| Create per-branch product SKUs for the same item | Catalog is store-global; use price books for branch pricing |
| Store mutable “current stock” on the product row | Use inventory ledger + reservations; `product.stock` may exist only as a **cached aggregate** (dual-write), never as source of truth |
| Delete posted financial or inventory ledger rows | Use reversal entries and compensating ledger lines |

---

## 2.1 RBAC & Data Access (Who Can See What)

Data **ownership** (scope) is separate from **access** (roles). All rules below apply within one `storeId`.

| Role pattern | Branch data | Warehouse data | Store-wide masters |
| :--- | :--- | :--- | :--- |
| Branch cashier / store manager | Own `branchId` only | View linked warehouse stock (read-only) | Catalog, customers (read) |
| Warehouse operator | No other branches’ POS | Own `warehouseId` only | PO/GRN references (read) |
| Branch manager | Own branch + reports | Linked warehouses | Price books (read), expenses |
| Procurement / finance (store) | All branches (read) | All warehouses (read) | Full masters + GL |
| Store owner / global admin | All | All | All |

**Enforcement**

- Users belong to **Store**; effective scope comes from **assignment** (`homeBranchId`, `warehouseId`, or global role)—not from duplicating user records per branch.
- API queries must filter by primary scope FK **and** RBAC assignment (defense in depth).
- See [ERP-Customer-Boundaries.md](./ERP-Customer-Boundaries.md) for customer vs staff boundaries (`preferredBranchId` is relationship metadata, not a second customer master).

---

## 3. Module Breakdown by Primary Scope

Below, **Primary** = required scope for create/own; **References** = optional FKs for routing, reporting, or workflow.

### Global (Store) — Primary: `storeId`

*Master data and corporate functions. No mandatory `branchId` or `warehouseId` on the owning row.*

| Domain | Entities / modules | Notes |
| :--- | :--- | :--- |
| **System & identity** | Stores, subscription plans, platform settings, roles/permissions (store-scoped) | Users belong to store; **assignment** to branch/warehouse is access control, not data ownership |
| **Organization master** | `Branches`, `Warehouses`, branch↔warehouse links, departments, cost centers | Definitions only; operations happen in branch/warehouse modules |
| **Catalog** | Products, variants, categories, brands, media | One catalog per store; branch-specific **selling price** via price books / assignments |
| **Pricing (master)** | Price books, base rules | **Assignment** to branch/channel/customer group is configuration, not a separate product |
| **Finance (core)** | Chart of accounts, journal entries, ledger lines, tax config | Journal **lines** may carry optional `branchId` for branch P&L (see Finance design) |
| **Procurement (master & commitment)** | Suppliers, RFQs, purchase requisitions, purchase orders (header), PO approval, supplier bills (AP) | PO **must** reference target `warehouseId`; RFQ/PR are store planning; **GRN execution** is warehouse |
| **Finance (sub-ledgers)** | Accounts receivable (customer balances), accounts payable (supplier balances), bank accounts | Sub-ledgers are store; branch appears on originating **transactions** only |
| **CRM (master)** | Customers, leads, campaigns, subscribers, loyalty programs, wallet/credit limits | Single customer profile; optional `preferredBranchId` for marketing—not a separate customer per branch |
| **HR (master)** | Employees, departments, designations, payroll runs, leave policies | Employee may have **home branch** as optional assignment FK, not ownership of HR master |
| **Platform (store config)** | Notifications templates, webhooks, feature flags, integration credentials | No branch/warehouse scope; still isolated by `storeId` |
| **Analytics / BI** | Dashboards, KPI definitions, scheduled reports | **Read-only** aggregation across scopes; does not own transactional rows |

### Branch — Primary: `storeId` + `branchId`

*Daily operations, sales, and branch-level costs.*

| Domain | Entities / modules | References (not ownership) |
| :--- | :--- | :--- |
| **POS & retail** | POS registers, POS shifts, cash drawer sessions, shift reconciliation | `warehouseId` if fulfilling from linked back-room warehouse |
| **Commerce (pre-sale)** | Carts, checkout sessions (in-progress) | Scoped to channel: POS cart → `branchId`; web cart → store until checkout assigns branch/warehouse |
| **Sales** | Orders (when sold at branch), payments, payment splits | `fulfilledFromWarehouseId`, `customerId` (store master) |
| **Returns & exchanges** | Return requests, refund authorizations (sales context) | Restock posts to **warehouse** ledger; financial reversal via **store** journal |
| **Branch finance** | Branch expenses (utilities, local spend) | Posts to store journal via events |
| **HR (operations)** | Attendance, shift schedules at location | `employeeId` (store master) |

**Orders scoping**

| Channel | Primary scope | Rule |
| :--- | :--- | :--- |
| POS / in-store | Branch | `branchId` required at creation |
| Online / marketplace | Store until routed | Set `branchId` / fulfillment warehouse when sourcing assigns |

### Warehouse — Primary: `storeId` + `warehouseId`

*Physical stock and logistics. Mandatory `warehouseId` on owning rows.*

| Domain | Entities / modules | References |
| :--- | :--- | :--- |
| **Inventory** | Inventory ledger (source of truth), stock reservations, stock audits, warehouse bins/zones, batch/expiry on lines | Optional `branchId` on ledger **only** as reporting dimension—not stock ownership |
| **Adjustments** | Damage, shrinkage, cycle-count corrections | Always ledger + event; never direct `product.stock` UPDATE |
| **Inbound** | GRN, GRN lines | `poId` (store), `supplierId` (store) |
| **Supplier returns** | Return-to-vendor / debit note (physical out) | `supplierId`, `poId`/`grnId` (store refs); qty out via warehouse ledger |
| **Internal logistics** | Stock transfers (in-transit), transfer lines | Source and destination `warehouseId` (two warehouse scopes + in-transit state) |
| **Outbound** | Fulfillment tasks (pick/pack), shipments, delivery tracking | `orderId` (branch or routed order) |

**Procurement execution (warehouse-owned rows)**

| Entity | Primary owner | Store references |
| :--- | :--- | :--- |
| GRN / GRN items | Warehouse | PO, supplier |
| Inventory impact of receive | Warehouse | PO line, valuation from store config |

Supplier bills / AP matching may be **Store** records triggered by warehouse GRN events; payment still flows through global accounting.

---

## 4. Cross-Scope & Dual-Field Entities

Some rows are **owned** at one tier but **carry** FKs to other tiers for workflow or reporting.

| Entity | Primary scope | Required FKs | Optional / reporting FKs |
| :--- | :--- | :--- | :--- |
| Purchase order | Store | `storeId`, `warehouseId` (ship-to) | `branchId` only if PO is branch-initiated (rare) |
| Order | Branch (when sold at branch) | `storeId`, `branchId` (when known) | `fulfilledFromWarehouseId`, `customerId` |
| Inventory ledger line | Warehouse | `storeId`, `warehouseId` | `branchId` (dimension only), `orderId`, `grnId` |
| Journal entry line | Store | `storeId`, `accountId` | `branchId` for branch P&L |
| Employee | Store | `storeId` | `homeBranchId` for RBAC and attendance default |
| User / staff session | Store | `storeId` | Current assignment: branch **or** warehouse |
| Cart / checkout (web) | Store (until placed) | `storeId` | `branchId` / `warehouseId` after sourcing |
| Stock reservation | Warehouse | `storeId`, `warehouseId` | `orderId`, `cartId` |
| Return (RMA) | Branch | `storeId`, `branchId` | `warehouseId` (restock location), original `orderId` |
| Supplier debit note | Store | `storeId`, `supplierId` | `warehouseId`, `grnId` |
| Supplier bill (AP) | Store | `storeId`, `supplierId` | `poId`, `grnId`, `warehouseId` |
| Loyalty / wallet balance | Store | `storeId`, `customerId` | Branch of earning transaction on order line only |

**Employee rule (decide once per product):**

- **Corporate / HQ staff:** Store-global employee record; no required `branchId`; RBAC via roles.
- **Branch / warehouse staff:** Same store employee record + **required assignment** (`homeBranchId` and/or warehouse assignment) for access boundaries.

---

## 5. Module Ownership Summary

| Module | Primary owner | Who executes | Who consolidates financially |
| :--- | :--- | :--- | :--- |
| Catalog / pricing master | Store | All branches | Store (list prices; branch overrides via price books) |
| POS / sales | Branch | Branch staff | Store (journal from sale events) |
| Stock on hand | Warehouse | Warehouse staff | Store (inventory asset on books) |
| PO (commitment) | Store | Procurement / managers | Store (commitment; AP on GRN) |
| GRN / receiving | Warehouse | Warehouse staff | Store (AP, inventory debit) |
| Customers (master) | Store | Branches use shared profile | Store |
| Expenses (store-level) | Branch | Branch managers | Store (expense journal lines) |
| Payroll | Store | HR | Store |
| Attendance | Branch | Branch | Store (payroll input) |
| Accounting / GL | Store | Finance | Store |
| Cart / checkout (active) | Store or Branch | Storefront / POS | — |
| Returns / RMA | Branch | Branch + warehouse restock | Store (reversal entries) |
| RFQ / purchase requisition | Store | Procurement | Store |
| Supplier bill (AP) | Store | Finance + procurement | Store |
| Stock reservation | Warehouse | Commerce / warehouse | — |
| Stock transfer | Warehouse (×2) | Warehouse staff | Store (inter-warehouse valuation) |
| Loyalty / wallet | Store | All channels | Store |
| Platform / notifications | Store | Platform jobs | — |
| Analytics / BI | Store (read model) | — | Store (reports) |

---

## 6. Key Integration Flows & Scope Handoffs

### Flow 1: Procure-to-pay (Store → Warehouse → Store)

1. **Store:** Procurement creates **PO** with `warehouseId` = intended receipt location.
2. **Warehouse:** Receiving creates **GRN** → updates **inventory ledger** at that `warehouseId`.
3. **Store:** GRN confirmed event → **journal entry** (debit inventory, credit AP); optional `branchId` on lines only if allocating cost to a branch.

### Flow 2: Order-to-cash (Branch → Warehouse → Store)

1. **Branch:** POS creates **order** with `branchId`.
2. **Warehouse:** Stock issue posts **inventory ledger** (reduce qty at fulfilling `warehouseId`).
3. **Store:** Sale event → **journal entries** (cash/revenue, COGS/inventory) with optional `branchId` on lines for branch P&L.

### Flow 3: Online order (Store → Branch/Warehouse → Store)

1. **Store:** Order created without branch (or with channel only).
2. **Warehouse:** On checkout, **stock reservation** at chosen `warehouseId` (see inventory guideline).
3. **Sourcing:** Assign `branchId` (reporting) and confirm fulfilling warehouse.
4. **Warehouse:** On ship, reservation released → **SALE** ledger line; **Store:** revenue + COGS journals.

### Flow 4: Customer return (Branch → Warehouse → Store)

1. **Branch:** Return/RMA created against original order (`branchId` = selling branch).
2. **Warehouse:** Accepted goods → **RETURN** ledger line at receiving `warehouseId`.
3. **Store:** Refund payment + reversal journal (revenue, tax, COGS/inventory as applicable).

### Flow 5: Inter-warehouse transfer (Warehouse → Warehouse → Store)

1. **Warehouse A:** `TRANSFER_OUT` ledger (or in-transit document).
2. **In transit:** Optional state on transfer header (still warehouse domain).
3. **Warehouse B:** `TRANSFER_IN` ledger; **Store:** optional inter-branch cost allocation via journal line dimensions.

### Flow 6: Supplier return / debit note (Warehouse → Store)

1. **Warehouse:** Ship damaged goods back → negative ledger at `warehouseId`.
2. **Store:** Supplier debit note reduces AP; links to `grnId` / `poId` where applicable.

---

## 7. Engineering Enforcement Checklist

Align entities with the boundaries above.

1. **Branch-mandatory FKs:** `PosRegister`, `PosShift`, branch-scoped `Expense`, `Attendance` → require `branchId`.
2. **Warehouse-mandatory FKs:** `InventoryLedger`, `Grn`, `FulfillmentTask`, stock transfer headers → require `warehouseId`.
3. **Store procurement:** `PurchaseOrder` → `storeId` + required `warehouseId` (destination); do not model PO as branch-owned unless product explicitly supports branch-initiated POs.
4. **Orders:** Persist `soldAtBranchId` and `fulfilledFromWarehouseId` when known (audit trail per ownership doc).
5. **Inventory ledger:** Never use optional `branchId` to imply branch stock ownership; document as reporting dimension only.
6. **Accounting:** COA and journal headers remain `storeId` only; branch profitability via `branchId` on **journal lines** or event metadata, not duplicate account tables.
7. **Employees:** Enforce assignment rules (corporate vs branch/warehouse staff) in RBAC, not by duplicating employee master per branch.
8. **Reservations:** `StockReservation` (or equivalent) → require `warehouseId`; tie lifecycle to order/cart events.
9. **Returns:** `Return` / RMA → require `branchId` + restock `warehouseId`; never skip warehouse ledger on restock.
10. **Customers:** One master per store; use `preferredBranchId`, `priceBookId`, `creditLimit` on same record (see customer boundaries doc).
11. **Inventory API:** Route all qty changes through `InventoryLedgerService`; block direct `product.stock` updates in new code.
12. **Audit:** Platform audit log → `storeId` only; no hard delete on ledger/journal tables.

---

## 8. Complete Module Index (All Domains)

Quick reference: every macro domain from [ERP-Architecture.md](./ERP-Architecture.md) mapped to **primary scope**.

| Domain | Primary scope | Key entities |
| :--- | :--- | :--- |
| Identity | Store | Users, roles, permissions, sessions, audit logs |
| Organization | Store (definitions) | Branches, warehouses, departments, cost centers, branch↔warehouse links |
| Catalog | Store | Products, variants, brands, categories, media |
| Pricing | Store (+ branch **assignment**) | Price books, rules, channel/branch assignments |
| Inventory | Warehouse | Ledger, reservations, bins, audits, adjustments, transfers |
| Commerce | Branch (order) / Store (cart) | Cart, checkout, orders, payments, refunds, returns |
| Fulfillment | Warehouse | Pick/pack tasks, shipments, delivery tracking |
| Procurement | Store (PO) + Warehouse (GRN) | Suppliers, RFQ, PR, PO, GRN, supplier bills, debit notes |
| Accounting | Store | COA, journals, ledger lines, AR/AP, tax, reports |
| CRM | Store | Customers, loyalty, wallet, campaigns, tickets/leads |
| HRM | Store (master) + Branch (ops) | Employees, payroll, leave; attendance at branch |
| Analytics | Store (read-only) | BI, KPIs, forecasts—derived from events/warehouse |
| Platform | Store | Notifications, workflows, queues, webhooks, integrations, feature flags |

---

## 9. Document Status & Gaps Resolved

This revision corrects earlier ambiguities:

| Topic | Before (ambiguous) | After (boundary) |
| :--- | :--- | :--- |
| Purchase orders | Listed entirely under Global | **Store-owned** with mandatory **warehouse** destination; GRN under Warehouse |
| Inventory + branch | Implied branch could “own” stock via `branchId` | **Warehouse owns stock**; `branchId` on ledger is reporting only |
| Payroll / HR | Mixed global and branch without rule | **Master = Store**; **attendance/shifts = Branch** |
| Online orders | “Global or branch” without routing | **Unassigned until sourced**, then branch + warehouse FKs |
| Accounting | Global with unclear branch P&L | **Global GL**; branch via line-level dimension |
| Returns / cart / reservations | Not documented | **Cart** (store/branch), **reservations** (warehouse), **returns** (branch + warehouse + store GL) |
| RFQ / AP / loyalty / platform | Missing | Added to store/warehouse tables and module index |
| RBAC vs ownership | Conflated | **§2.1** separates scope FKs from role-based visibility |

For deeper ownership narrative and anti-patterns, see [ERP-Ownership-Boundaries.md](./ERP-Ownership-Boundaries.md).
