# ERP Transformation Guideline

This document provides a technical roadmap for converting the current eCommerce codebase into a modular ERP SaaS.

---

## Phase 1: Organization & Identity (The Foundation)
**Goal:** Support multi-branch and warehouse operations.

1.  **Create New Module: `server/src/modules/system/organization`**
    *   Implement `BranchEntity` and `WarehouseEntity`.
    *   Link `TenantEntity` to `BranchEntity` and `WarehouseEntity` (1:N).
2.  **Modify User Module: `server/src/modules/admin/core/user`**
    *   Update `UserEntity` to include `branchId` or `warehouseId` for scoped access.
    *   Update RBAC to check permissions based on the active Branch/Warehouse.

---

## Phase 2: Inventory Ledger (The Engine)
**Goal:** Move stock tracking from a single column to a movement ledger.

1.  **Refactor Product Entity: `server/src/modules/admin/catalog/product/entities/product.entity.ts`**
    *   **Action:** Mark `stock` as `@Deprecated`. 
    *   **Action:** Add relationship to `InventoryLedger`.
2.  **Enhance Logistics Module: `server/src/modules/admin/operations/logistics/inventory-transaction`**
    *   Rename/Refactor to `inventory-ledger`.
    *   Update `InventoryTransactionEntity` to include `branchId`, `warehouseId`, and `binId`.
    *   Add a `balance_after` snapshot for faster stock queries.
3.  **Implement Multi-Tier Pricing (Retail/Wholesale)**:
    *   Create `PriceBookEntity` and `ProductPriceEntity`.
    *   Allow products to have different prices based on "Minimum Quantity" (Wholesale tiers).

---

## Phase 3: Financial Engine (The Brain)
**Goal:** Implement automated double-entry bookkeeping.

1.  **Create New Module: `server/src/modules/admin/operations/finance/accounting`**
    *   Implement `ChartOfAccountsEntity`, `JournalEntryEntity`, and `LedgerEntryEntity`.
2.  **Implement Event Listeners:**
    *   Listen to `OrderPlacedEvent` → Create Journal Entry (Debit AR, Credit Revenue).
    *   Listen to `StockReceivedEvent` → Create Journal Entry (Debit Inventory, Credit AP).

---

## Phase 4: Supply Chain & Procurement (SCM)
**Goal:** Formalize the purchasing and receiving flow.

1.  **Modify Purchase Module: `server/src/modules/admin/operations/finance/purchase`**
    *   Create `GoodsReceivedNoteEntity` (GRN).
    *   Logic: When a GRN is "Verified", automatically trigger a `StockMovement` in the Inventory Ledger.
2.  **Enhance Supplier Module: `server/src/modules/admin/operations/finance/supplier`**
    *   Add "Accounts Payable" (AP) tracking to track how much is owed to each supplier.

---

## Phase 5: Decoupled Fulfillment
**Goal:** Separate sales from logistics.

1.  **Modify Sales Module: `server/src/modules/admin/sales/order`**
    *   When an Order is "Confirmed", create a record in a new `fulfillment_tasks` table.
2.  **Warehouse Operations**:
    *   Create a mobile-friendly view for Warehouse staff to "Pick" and "Pack" items based on Bins defined in Phase 1.

---

## Summary of File Changes

| Component | Files to Create/Modify |
| :--- | :--- |
| **Org** | `server/src/modules/system/organization/**` |
| **Catalog** | `server/src/modules/admin/catalog/product/entities/product.entity.ts` |
| **Finance** | `server/src/modules/admin/operations/finance/accounting/**` |
| **Logistics** | `server/src/modules/admin/operations/logistics/inventory-transaction/**` |
| **Sales** | `server/src/modules/admin/sales/order/entities/order.entity.ts` |

---

### How to use this guideline:
1.  **Start with Phase 1**: Do not write any inventory or accounting code until the `Branch` and `Warehouse` entities are ready.
2.  **Follow the Flow**: Every time you build a feature, ask: *"Which Branch/Warehouse owns this data?"* and *"What is the financial impact of this action?"*
3.  **Automate**: Use NestJS `EventEmitter` to make sure the Accounting module stays updated without messy code in the Sales module.
