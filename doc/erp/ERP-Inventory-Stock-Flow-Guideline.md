# ERP Inventory & Stock Flow Guideline

## Overview
The ERP system uses an **Event-Driven Immutable Ledger** (The "Engine") for inventory tracking, rather than simply updating a mutable `stock` column. This ensures complete auditability, precise financial costing (COGS), and multi-warehouse support.

To maintain backward compatibility with the legacy storefront, the system employs a **Dual-Write Strategy**, updating both the new ledger and the legacy `stock` columns simultaneously.

---

## 1. Product Entity Architecture
The `ProductEntity` (and `ProductVariantEntity`) contains several stock-related columns:

*   **`stock`**: (Deprecated as Source of Truth). This is now a cached aggregate representing `quantity_on_hand` across all warehouses.
*   **`reservedStock`**: Tracks items that have been ordered by customers but not yet shipped. (Available Stock = `stock` - `reservedStock`).
*   **`lowStockThreshold`**: The trigger point for low-stock alerts.

### The Source of Truth: `InventoryLedgerEntity`
Instead of relying on the `stock` column, the real stock count is derived from the `InventoryLedgerEntity`. Every single movement (in or out) is recorded as an immutable row.

---

## 2. How Stock Increases (Procurement Flow)
Stock increases primarily happen through the Procurement module when a Purchase Order (PO) is fulfilled.

### The Workflow:
1.  **Purchase Order (PO)**: A PO is issued to a supplier. This does *not* affect stock.
2.  **Goods Received Note (GRN)**: When goods arrive at the warehouse, a GRN is processed.
3.  **The Engine Triggers**:
    *   The `ProcurementService` calls `InventoryLedgerService.createLedgerEntry()` with type `PURCHASE`.
    *   The ledger records the positive quantity (+X) and the `unitCost`.
    *   **Dual-Write**: The engine automatically increments the `stock` column on the `ProductEntity` or `ProductVariantEntity`.
4.  **Financial Sync**: The engine triggers the `AccountingIntegrationService`, creating a journal entry:
    *   *Debit*: Inventory Asset Account (Value increases)
    *   *Credit*: Accounts Payable (Debt to supplier increases)

---

## 3. How Stock Decreases (Sales Flow)
Stock decreases happen when a customer places an order and the item is shipped.

### The Workflow:
1.  **Order Placed (Reservation)**:
    *   When a customer checks out, the engine creates a `RESERVATION` entry.
    *   **Dual-Write**: It *decrements* the `stock` column and *increments* the `reservedStock` column. This prevents overselling.
2.  **Order Fulfilled (Shipment)**:
    *   When the warehouse ships the item, the engine creates a `SALE` entry.
    *   **Dual-Write**: It *decrements* the `reservedStock` column (since the item has physically left).
3.  **Financial Sync (COGS)**:
    *   The `CogsService` calculates the exact cost of the goods sold based on the original purchase price (FIFO/Weighted Average).
    *   A journal entry is created:
        *   *Debit*: Cost of Goods Sold (COGS Expense)
        *   *Credit*: Inventory Asset Account (Value decreases)

---

## 4. Other Stock Movements
The Inventory Ledger handles other adjustments automatically:
*   **TRANSFER_IN / TRANSFER_OUT**: Moving stock between branches/warehouses.
*   **DAMAGE / SHRINKAGE**: Manual adjustments for lost or broken items (decreases stock, writes off asset value).
*   **RETURN**: Customer returns (increases stock, reverses COGS).

## 5. Implementation Summary for Developers
When building new features that affect inventory:
1.  **NEVER** update `product.stock` manually using `repository.update()`.
2.  **ALWAYS** use `InventoryLedgerService.createLedgerEntry()`.
3.  Pass the correct `InventoryTransactionType` (e.g., `PURCHASE`, `SALE`, `ADJUSTMENT`).
4.  The Engine will automatically handle the Dual-Write to the legacy columns and the double-entry accounting.
