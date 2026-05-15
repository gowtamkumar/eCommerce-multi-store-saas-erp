# Point of Sale (POS) & Retail System Design

This document provides a detailed architectural and functional design for the Point of Sale (POS) and Retail domain within the ERP system.

---

## 1. POS Philosophy
The POS is the "front line" of a retail business. It must be:
- **Fast**: Minimal clicks to complete a sale.
- **Reliable**: Must work offline if the internet fails.
- **Secure**: Strict tracking of cash and inventory.
- **Integrated**: Real-time sync with Inventory and Accounting.

---

## 2. Core POS Entities (Database Design)

### 2.1 POS Register / Counter
Represents a physical terminal in a branch.
- `id`: UUID
- `branchId`: UUID (Relation to Branch)
- `name`: string (e.g., "Counter 01")
- `code`: string (Unique identifier)
- `status`: enum (ACTIVE, INACTIVE, MAINTENANCE)
- `currentShiftId`: UUID (Nullable, link to active shift)

### 2.2 POS Shift (Register Session)
Tracks a cashier's session and cash reconciliation.
- `id`: UUID
- `registerId`: UUID
- `userId`: UUID (The cashier)
- `startTime`: timestamp
- `endTime`: timestamp (nullable)
- `openingBalance`: decimal (Initial cash in drawer)
- `closingBalance`: decimal (Actual cash in drawer at end)
- `expectedBalance`: decimal (Calculated balance based on sales)
- `difference`: decimal (Discrepancy)
- `status`: enum (OPEN, CLOSED, DISCREPANCY)
- `notes`: text

### 2.3 POS Order (Retail Order)
Extends the core `Order` entity with POS-specific metadata.
- `id`: UUID
- `shiftId`: UUID (Track which shift made the sale)
- `orderNumber`: string (Short, readable code like `POS-001-1234`)
- `type`: enum (RETAIL, WHOLESALE)
- `customerId`: UUID (Guest or registered customer)
- `paymentStatus`: enum (PAID, PARTIAL, UNPAID)
- `isOffline`: boolean (Flag for offline-created orders)
- `syncedAt`: timestamp (When it hit the server)

### 2.4 POS Payment Detail
Tracks multiple payment methods for a single order.
- `orderId`: UUID
- `method`: enum (CASH, CARD, MOBILE_WALLET, CREDIT)
- `amount`: decimal
- `transactionReference`: string (e.g., Last 4 digits of card)

---

## 3. Key Workflows

### 3.1 Register Opening (Start of Day/Shift)
1. Cashier logs in to a specific **Branch**.
2. Selects an available **POS Counter**.
3. Enters the **Opening Balance** (Float cash).
4. System creates a new **POS Shift**.

### 3.2 The Sales Process (The "Hot Path")
1. **Scan/Search**: Items added to cart via Barcode or UI search.
2. **Apply Discounts**: Coupons or manual line-item discounts (based on permissions).
3. **Select Customer**: Default to "Guest" or search for loyalty members.
4. **Checkout**: 
    - Selection of payment methods.
    - System calculates tax in real-time (or offline fallback).
    - Print receipt (Thermal).
5. **Inventory Update**: 
    - Immediate local deduction.
    - Async sync to server to update the **Inventory Ledger**.

### 3.3 Register Closing (End of Day/Shift)
1. Cashier initiates "Close Shift".
2. System displays **Expected Cash** (Opening + Cash Sales - Cash Returns).
3. Cashier performs "Cash Count" and enters **Closing Balance**.
4. System calculates **Difference**.
5. Shift is locked. Manager review required if difference exceeds threshold.

---

## 4. Offline-First Architecture

To ensure business continuity, the POS UI should use an offline-first strategy.

### 4.1 Local Storage
- Use **IndexedDB** or **SQLite (WASM)** in the browser.
- Store:
    - Products (Minimal subset: ID, Name, Price, Barcode, Tax).
    - Active Shift data.
    - Pending Orders (Queue).

### 4.2 Sync Strategy
1. **Outgoing**: Background worker periodically pushes pending orders to the API.
2. **Conflict Resolution**: Server-side timestamp checks. Server is the source of truth for order numbers.
3. **Incoming**: Periodically pull price updates and inventory availability.

---

## 5. Retail Specific Features

### 5.1 Barcode Generation
- Support for EAN-13, QR, and Code-128.
- Automatic label printing during Goods Received (GRN).

### 5.2 Pricing Engines
- **Retail Price**: Default.
- **Wholesale Price**: Applied if customer is marked as "Wholesale".
- **Promotional Price**: Time-based or Volume-based (BOGO).

### 5.3 Return & Exchange at POS
- Fast lookup of original invoice.
- "Return to Stock" vs "Damage" logic.
- Issue Store Credit (Wallet) or Cash Refund.

---

## 6. Security & Audit
- **Cashier Permissions**: Cannot edit prices or delete orders without Manager override (Supervisor Pin).
- **Audit Logs**: Track every price change or order cancellation at the POS.
- **IP/Device Binding**: Restrict POS access to specific white-listed devices or IP ranges.
