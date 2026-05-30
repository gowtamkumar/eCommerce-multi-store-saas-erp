# Return, Refund, & Exchange System Guide

This document outlines the end-to-end low-level system design, data relationships, step-by-step processing lifecycles, and accounting reconciliation logic for the Return, Refund, and Exchange modules in the multi-tenant eCommerce SaaS platform.

---

## 1. 🔄 System Lifecycle & Workflow

The return lifecycle governs how returned items are requested, received, restocked, and resolved through either a cash/card/wallet refund or a replacement exchange.

### Lifecycle Transitions (ASCII Flowchart)

```
  [Start] ➔ Create Return Request ➔ PENDING
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
                 RECEIVED (Warehouse)             REJECTED ➔ [End]
                    │                                 ▲
                    ├─────────────────────────────────┤
                    ▼                                 
                 APPROVED (Restock Shelf Stock)
                    │
                    ├───────────────┬────────────────┐
                    ▼               ▼                ▼
                 REFUNDED        EXCHANGED       CANCELLED
                 (Payout)      (Link Sale)       (Aborted)
                    │               │                │
                    ▼               ▼                ▼
                  [End]           [End]            [End]
```

### Process Breakdown

#### Step 1: Request Creation (`PENDING`)
* **Customer Storefront / POS Counter** submits a request specifying the original `orderId`, target quantities for returning, and `returnType` (`refund` or `exchange`).
* Backend creates an `OrderReturnEntity` in `PENDING` state and calculates the `refundAmount` based on unit prices and applied discounts.

#### Step 2: Physical Receipt (`RECEIVED`)
* The warehouse staff inspects the package and marks items as physically received via `Patch /returns/:id/received`.
* The status transitions to `RECEIVED`.

#### Step 3: Authorization (`APPROVED`)
* The administrator reviews the return and updates the status to `APPROVED`.
* **Inventory Restock Trigger**: At the moment of approval, the system triggers `restockItems()`, writing positive adjustments to `InventoryLedgerEntry` to restore shelf stock.

#### Step 4: Resolution (`REFUNDED` or `EXCHANGED`)
* **Straight Refund**: The admin executes the payout via Cash, Card, Mobile payment, Bank Transfer, or Store Credit (Wallet). The status transitions to `REFUNDED`.
* **Exchange**: The customer selects replacement items. A new POS sale order is created, and the admin links it to the return request. The status transitions to `EXCHANGED`.

---

## 2. 🗄️ Database Schema & Relationships

The return module bridges sales history, logistics, and double-entry accounting. Below are the key entities, schema definitions, and relationships mapping the system.

### Key Relationships
* **Orders (`orders`)**:
  * Has many **Order Items (`order_items`)**
  * Initiates many **Returns (`returns`)**
* **Returns (`returns`)**:
  * Belongs to one **Order (`orders`)** via `order_id`
  * Belongs to one **User/Customer (`users`)** via `user_id`
  * Belongs to one optional replacement **Order (`orders`)** via `exchange_order_id` (used only for `exchange` type returns)
  * Creates many **Journal Entries (`journal_entries`)** via `reference_id`
  * Creates optional **Wallet Transactions (`wallet_transactions`)** via `reference_id`
  * Has many **Inventory Ledger Entries (`inventory_ledger`)** via `reference_id`

### Schema Definitions

#### `orders` (Sales Orders)
* `id` (UUID, Primary Key)
* `customer_name` (Varchar)
* `customer_email` (Varchar)
* `customer_phone` (Varchar)
* `total_amount` (Decimal)
* `status` (Varchar)
* `payment_method` (Varchar)
* `offline_sale_id` (UUID, Nullable)

#### `returns` (Return Requests)
* `id` (UUID, Primary Key)
* `order_id` (UUID, Foreign Key referencing `orders.id`)
* `user_id` (UUID, Foreign Key referencing `users.id`)
* `return_type` (Varchar: `'refund'` or `'exchange'`)
* `refund_method` (Varchar: `'store_credit'`, `'cash'`, `'card'`, `'mobile'`, or `'bank_transfer'`)
* `status` (Varchar: `'pending'`, `'received'`, `'approved'`, `'refunded'`, or `'exchanged'`)
* `refund_amount` (Decimal)
* `exchange_order_id` (UUID, Foreign Key referencing `orders.id`, Nullable)

#### `order_items` (Ordered Products)
* `id` (UUID, Primary Key)
* `order_id` (UUID, Foreign Key referencing `orders.id`)
* `product_id` (UUID)
* `variant_id` (UUID, Nullable)
* `quantity` (Integer)
* `unit_price` (Decimal)

#### `wallet_transactions` (Store Credit Bookkeeping)
* `id` (UUID, Primary Key)
* `user_id` (UUID, Foreign Key referencing `users.id`)
* `amount` (Decimal)
* `type` (Varchar: `'store_credit'`)
* `reference_type` (Varchar: `'ORDER_RETURN'`)
* `reference_id` (UUID, Foreign Key referencing `returns.id`)

#### `journal_entries` (General Ledger Records)
* `id` (UUID, Primary Key)
* `type` (Varchar: `'sales'`, `'cash_payment'`, or `'general'`)
* `reference_type` (Varchar: `'ORDER_RETURN'` or `'ORDER_EXCHANGE'`)
* `reference_id` (UUID, Foreign Key referencing `returns.id`)

---

## 3. 🏪 POS Counter Return & Exchange Integration

Point of Sale (POS) environments process returns and exchanges instantly at the counter. Here is the step-by-step API execution sequence for a POS-driven exchange.

### Step-by-Step API Execution Sequence

#### 1. Order Inquiry & Item Selection
* **Action**: Cashier searches the original sale by entering the invoice code or scanning a receipt barcode.
* **API Call**: `GET /orders/:id` (searches by ID or falls back to list query with search filter).
* **Data Flow**: Server fetches the order from the database and returns the list of bought items with their quantities, prices, and return history.

#### 2. Return Generation
* **Action**: Cashier selects the quantities of items the customer is returning, chooses "Exchange" mode, and clicks submit.
* **API Call**: `POST /returns`
  * Body: `{ orderId: "...", reason: "...", returnType: "exchange", items: [...] }`
* **Data Flow**: Backend creates the return request in the `PENDING` state.

#### 3. Automatic Approval & Restock
* **Action**: Because this is a physical counter return, the POS UI automatically triggers approval and receipt status transitions immediately.
* **API Call**: `PATCH /returns/:id/status` (status: `"approved"`) and `PATCH /returns/:id/status` (status: `"refunded"`)
* **Data Flow**:
  * Service updates return status to `APPROVED` and calls `restockItems()`.
  * Service writes positive stock additions to the `InventoryLedgerEntry` table.

#### 4. Payment Re-routing

* **If the Customer is Registered (Store Credit flow)**:
  * Backend credits the customer's wallet balance.
  * POS UI automatically enables the **Wallet Payment Mode** in checkout and sets the amount-to-use to match the return refund value.
  * Cashier rings up the new replacement items in the cart and hits Checkout.
  * **API Call**: `POST /pos/sync` (passing wallet deduction parameters).
  * **Data Flow**: Backend saves the new replacement order and subtracts the wallet liability.

* **If the Customer is a Guest (Walk-in flow)**:
  * POS UI displays a prompt: *"Please issue a CASH or CARD refund for the return of $X, and then ring up the exchange items as a new sale."*
  * Cashier physically hands cash or swipes card refund, and clears the cart.
  * Cashier rings up the replacement items as a new sale.
  * **API Call**: `POST /pos/sync` (synced as standard cash/card payment).

---

## 4. 🧮 Double-Entry Accounting & Ledger Reconciliation

To keep the general ledger mathematically balanced, every step of the refund and exchange process writes balanced debit and credit entries.

### Ledger Account Maps
* **`1000`**: Cash / Bank Asset
* **`1200`**: Accounts Receivable (AR) Asset
* **`2200`**: Tax/VAT Liability
* **`2300`**: Wallet Liabilities (Store Credit Liability)
* **`4000`**: Sales Revenue
* **`5100`**: Sales Returns & Refunds Expense

---

### Transaction Matrix

#### Case A: Store Credit Refund (`STORE_CREDIT`)
Issued when a registered customer receives digital wallet credit.
* **Accounting Entries**:
  * **Debit `5100` (Sales Returns Expense)**: `[Refund Amount]`
  * **Credit `2300` (Wallet Liability)**: `[Refund Amount]`
* **Wallet System**: Automatically credits the customer's wallet balance.

#### Case B: Counter Payout (`CASH` or `CARD`)
Issued when cash is physically dispensed or a gateway reversal is executed.
* **Accounting Entries**:
  * **Debit `5100` (Sales Returns Expense)**: `[Refund Amount]`
  * **Credit `1000` (Cash / Bank Asset)**: `[Refund Amount]`

#### Case C: Exchange Reclaimed Revenue Reconciliation
When a return is linked to a new replacement order, a general ledger memo journal is posted to offset the revenue:
* **Accounting Entries**:
  * **Debit `5100` (Sales Returns Expense)**: `[Return Value]`
  * **Credit `4000` (Revenue)**: `[Return Value]`

> [!IMPORTANT]
> The general ledger postings are executed within database transactions (`await dataSource.transaction()`) alongside inventory adjustments to prevent ledger-inventory mismatches in case of network or database failures.
