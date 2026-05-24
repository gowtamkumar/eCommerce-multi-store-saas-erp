# Codebase Understanding — Logistics & Inventory Modules

This document provides a detailed breakdown of the codebase implementation for the inventory transactions, warehouse transfers, stock reservations, goods verification, fulfillment pipelines, and courier integrations.

---

## 1. Inventory Ledger & Batch Lot Domain

Located at: `server/src/modules/admin/operations/logistics/inventory-transaction/`.

### 1.1 Database Entities
*   **`InventoryLedgerEntity` (`entities/inventory-ledger.entity.ts`):**
    The central append-only log of stock changes. Stores `variantId`, `warehouseId`, `binId`, `quantity` (positive for receipts, negative for depletion), `type` (PURCHASE, SALE, TRANSFER, ADJUSTMENT), and snapshot `balanceAfter`. Scoped by `tenantId`.
*   **`ProductBatchEntity` (`entities/product-batch.entity.ts`):**
    Implements expiration tracking (FEFO) and manufacturing lots. Columns: `batchNumber`, `manufacturedDate`, `expiryDate`.

### 1.2 Services & Controllers
*   **`InventoryLedgerService` (`inventory-ledger.service.ts`):**
    Handles physical stock calculations. Disallows direct updates. Intercepts product transactions and commits records to `InventoryLedgerEntity`.
*   **`ProductBatchService` (`product-batch.service.ts`):**
    Tracks and allocates stock from specific batches based on expiration date.

### 1.3 Key API Endpoints
*   `GET /api/admin/logistics/inventory/ledger` — Audit stock ledger entries.
*   `POST /api/admin/logistics/inventory/adjust` — Request a manual stock adjustment.

---

## 2. Stock Reservation Domain

Located at: `server/src/modules/admin/operations/logistics/inventory-transaction/`.

### 2.1 Code Structure
*   **`StockReservationEntity` (`entities/stock-reservation.entity.ts`):**
    Locks quantities of a variant for active checkouts. Contains `orderId`, `quantity`, and `expiresAt`.
*   **`StockReservationSchedulerService` (`stock-reservation-scheduler.service.ts`):**
    A scheduled cron worker that routinely checks for expired reservations and releases the locked stock back to available inventory.

### 2.2 Key API Endpoints
*   `POST /api/admin/logistics/inventory/reservations` — Lock stock for a custom order.

---

## 3. Stock Transfer Domain

Located at: `server/src/modules/admin/operations/logistics/inventory-transaction/`.

### 3.1 Code Structure
*   **`StockTransferEntity` (`entities/stock-transfer.entity.ts`):**
    Tracks shipments moving between warehouses. Statuses: `DRAFT`, `APPROVED`, `IN_TRANSIT`, `RECEIVED`.
*   **`StockTransferItemEntity` (`entities/stock-transfer-item.entity.ts`):**
    Line items mapping quantities in transit.
*   **`StockTransferService` (`stock-transfer.service.ts`):**
    Handles multi-step validation. Transitioning to `IN_TRANSIT` deducts stock from the source warehouse ledger. Transitioning to `RECEIVED` adds stock to the destination warehouse ledger.

---

## 4. Goods Received Note (GRN) Domain

Located at: `server/src/modules/admin/operations/logistics/grn/`.

### 4.1 Database Entities
*   **`GrnEntity` / `GrnItemEntity` (`entities/`):**
    Verify physical goods delivery from suppliers. Links directly to a `PurchaseOrderEntity`. Holds columns for `qtyOrdered` vs `qtyReceived` and `qtyRejected`.

### 4.2 Services & Controllers
*   **`GrnService` (`grn.service.ts`):**
    Verifies goods receipts, increments physical warehouse inventory levels, and triggers accounting events to post general ledger entries.

---

## 5. Fulfillment & Courier Domain

Located at: `server/src/modules/admin/operations/logistics/fulfillment/` and `server/src/modules/admin/operations/logistics/courier/`.

### 5.1 Code Structure
*   **`FulfillmentModule` (`fulfillment/`):**
    Orchestrates pick-pack-ship operations, resolves split shipments, and assigns warehouse fulfillment slots.
*   **`CourierModule` (`courier/`):**
    Integrates external shipping APIs (e.g. Steadfast, Pathao). Transmits delivery weight, addresses, collects tracking codes, and reconciles Cash-on-Delivery (CoD) payouts.
