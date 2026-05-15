# Enterprise ERP Database Schema Design

This document outlines the proposed database schema to transform the eCommerce multi-tenant SaaS into a full-scale ERP system. It adheres to the domain-driven principles of **Ownership Boundaries**, **Inventory Ledgers**, and **Financial Immutability**.

---

## 1. Organization Domain
*Purpose: Defining the operational structure of the Tenant.*

### `branches`
A business unit where sales happen (e.g., Retail Store, Showroom).
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `name`: String
- `address`: Text
- `is_active`: Boolean

### `warehouses`
A physical location where stock is stored. Warehouses can serve multiple branches.
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `name`: String
- `location_type`: Enum (Central, Regional, Transit)
- `address`: Text
- `is_active`: Boolean
- `location_type`: Enum (Central, Regional, Transit)
- `address`: Text

### `warehouse_bins`
The smallest addressable storage unit.
- `id`: UUID (PK)
- `warehouse_id`: UUID (FK)
- `zone`: String (e.g., "Zone-A")
- `bin_code`: String (e.g., "A-01-05")

---

## 2. Advanced Inventory Domain (Ledger-Based)
*Purpose: Absolute auditability of stock movements.*

### `inventory_ledger`
**The absolute source of truth.** Every stock change (sale, purchase, return, adjustment) creates a record here.
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `warehouse_id`: UUID (FK)
- `bin_id`: UUID (FK, Nullable)
- `product_id`: UUID (FK)
- `variant_id`: UUID (FK, Nullable)
- `quantity`: Decimal (Positive for IN, Negative for OUT)
- `transaction_type`: Enum (PURCHASE, SALE, TRANSFER, ADJUSTMENT, RETURN, WASTE)
- `reference_type`: String (e.g., "ORDER", "GRN", "STOCK_ADJUSTMENT")
- `reference_id`: UUID
- `balance_after`: Decimal (Snapshot for performance)
- `created_at`: Timestamp

### `stock_reservations`
Holds stock for orders that are not yet shipped.
- `id`: UUID (PK)
- `order_id`: UUID (FK)
- `product_id`: UUID (FK)
- `quantity`: Decimal
- `expires_at`: Timestamp

---

## 2. Catalog & Pricing Domain (Retail & Wholesale)
*Purpose: Support for different sales channels.*

### `price_books`
Allows for multiple price lists (Retail, Wholesale, VIP).
- `id`: UUID (PK)
- `name`: String
- `tenant_id`: UUID (FK)

### `product_prices`
- `id`: UUID (PK)
- `price_book_id`: UUID (FK)
- `product_id`: UUID (FK)
- `min_quantity`: Decimal (For wholesale tiering, e.g., 1-10, 11-100)
- `price`: Decimal
*Purpose: Automated financial tracking based on business events.*

### `chart_of_accounts`
The list of accounts used to record transactions.
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `account_code`: String (e.g., 1001)
- `account_name`: String (e.g., "Inventory Asset")
- `account_type`: Enum (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- `parent_account_id`: UUID (FK, for hierarchy)

### `journal_entries`
A packet of balanced ledger entries.
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `reference_id`: UUID
- `reference_type`: String
- `description`: Text
- `entry_date`: Date

### `ledger_entries` (Debits & Credits)
- `id`: UUID (PK)
- `journal_entry_id`: UUID (FK)
- `account_id`: UUID (FK)
- `debit`: Decimal
- `credit`: Decimal
- `created_at`: Timestamp

---

## 4. Procurement Domain (SCM)
*Purpose: Controlling the inflow of goods and costs.*

### `goods_received_notes` (GRN)
Records the actual arrival of items.
- `id`: UUID (PK)
- `purchase_order_id`: UUID (FK)
- `warehouse_id`: UUID (FK)
- `received_date`: Timestamp
- `status`: Enum (PENDING, VERIFIED, REJECTED)

### `grn_items`
- `id`: UUID (PK)
- `grn_id`: UUID (FK)
- `product_id`: UUID (FK)
- `quantity_ordered`: Decimal
- `quantity_received`: Decimal
- `unit_cost`: Decimal

---

### `customers`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `customer_type`: Enum (RETAIL, WHOLESALE)
- `price_book_id`: UUID (FK, default price list)
- `credit_limit`: Decimal (For wholesale credit)
- `credit_terms`: Integer (Days, e.g., 30 for Net-30)
*Purpose: Managing the movement of goods out of the warehouse.*

### `fulfillment_tasks`
- `id`: UUID (PK)
- `order_id`: UUID (FK)
- `warehouse_id`: UUID (FK)
- `status`: Enum (PENDING, PICKING, PACKING, SHIPPED)
- `assigned_to`: UUID (User FK)

---

## 6. Relationships Mapping (Existing to New)

| Existing Entity | New Relationship | Change Required |
| :--- | :--- | :--- |
| `ProductEntity` | Belongs to `Tenant` | Remove `stock` column; stock is derived from `inventory_ledger`. |
| `OrderEntity` | Links to `Branch` | Sales should be attributed to a specific Branch for P&L reporting. |
| `PurchaseOrderEntity` | Links to `GRN` | PO is an intent; GRN is the actual inventory update trigger. |
| `UserEntity` | Links to `Branch/Warehouse` | RBAC needs to be scoped to specific Organizational units. |

---

## 7. Event-Driven Workflow Example

1. **Order Placed**:
   - `Order` created.
   - `stock_reservations` entry created (subtracts from "Available to Promise").
2. **Order Shipped**:
   - `inventory_ledger` entry created (Negative quantity).
   - `stock_reservations` removed.
   - `JournalEntry` created: 
     - **Debit** Cost of Goods Sold (Expense).
     - **Credit** Inventory Asset (Asset).
3. **Payment Received**:
   - `JournalEntry` created:
     - **Debit** Cash/Bank (Asset).
     - **Credit** Accounts Receivable (Asset).
