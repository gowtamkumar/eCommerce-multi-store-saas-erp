# Database Design & Entity Relationship Diagrams (ERD)

This document contains the unified Master ERD and per-domain database diagrams for the Enterprise Multi-Tenant SaaS ERP. Use these diagrams to trace table relations, foreign keys, and indices during manual QA database audits.

---

## 1. Master ERD (Cross-Domain Relationships)

This bird's-eye view shows how the major business aggregates link together across tenant boundaries.

```mermaid
erDiagram
  TENANTS ||--o{ BRANCHES                : "owns"
  TENANTS ||--o{ WAREHOUSES             : "owns"
  TENANTS ||--o{ USERS                  : "owns"
  TENANTS ||--o{ ROLES                  : "owns"
  TENANTS ||--o{ PRODUCTS               : "owns"
  TENANTS ||--o{ SUPPLIERS              : "owns"
  TENANTS ||--o{ ORDERS                 : "owns"
  TENANTS ||--o{ ACCOUNTS               : "owns"
  TENANTS ||--o{ EMPLOYEES              : "owns"
  TENANTS ||--o{ AUDIT_LOGS             : "owns"

  BRANCHES ||--o{ WAREHOUSES             : "hosts"
  WAREHOUSES ||--o{ WAREHOUSE_BINS      : "contains"

  USERS }o--o| ROLES                    : "primary role"
  USERS ||--o{ USER_ROLE_ASSIGNMENTS    : "has"
  USERS ||--o{ USER_PERMISSION_OVERRIDES : "has"
  ROLES ||--o{ ROLE_PERMISSIONS         : "grants"
  PERMISSIONS ||--o{ ROLE_PERMISSIONS   : "maps"
  USERS ||--o| EMPLOYEES                : "if staff"

  PRODUCTS ||--o{ PRODUCT_VARIANTS      : "has"
  PRODUCT_VARIANTS ||--o{ INVENTORY_LEDGER : "movements"
  PRODUCT_VARIANTS ||--o{ STOCK_RESERVATIONS : "locks"
  PRODUCT_VARIANTS ||--o{ PRODUCT_BATCHES : "lots"

  ORDERS ||--o{ ORDER_ITEMS             : "lines"
  ORDERS ||--o{ PAYMENTS                 : "split tender"
  ORDERS ||--o{ ORDER_RETURNS           : "returns"
  ORDERS }o--o| USERS                   : "customer"

  SUPPLIERS ||--o{ PURCHASE_ORDERS      : "receives"
  SUPPLIERS ||--o{ SUPPLIER_INVOICES     : "bills"
  PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : "lines"
  PURCHASE_ORDERS ||--o{ GOODS_RECEIVED_NOTES : "received via"
  GOODS_RECEIVED_NOTES ||--o{ GRN_ITEMS : "lines"
  GOODS_RECEIVED_NOTES ||--o{ INVENTORY_LEDGER : "adds stock"

  ACCOUNTS ||--o{ LEDGER_ENTRIES         : "ledger lines"
  JOURNAL_ENTRIES ||--o{ LEDGER_ENTRIES   : "contains"
  JOURNAL_ENTRIES }o--o| JOURNAL_ENTRIES  : "reversed by"

  USERS ||--o{ WALLET_LEDGER           : "balances"
  USERS ||--o{ LOYALTY_LEDGER          : "points"
  USERS ||--o{ AR_LEDGER               : "owes"

  EMPLOYEES ||--o{ ATTENDANCE_EVENTS    : "raw punches"
  EMPLOYEES ||--o{ LEAVE_REQUESTS       : "applies"
  EMPLOYEES ||--o{ PAYROLL_SLIPS        : "slips"
  PAYROLL_BATCHES ||--o{ PAYROLL_SLIPS   : "contains"

  POS_REGISTERS ||--o{ POS_SHIFTS       : "tracks"
  POS_SHIFTS ||--o{ POS_DRAWER_TRANSACTIONS : "cash flows"
```

---

## 2. Per-Domain Entity Relationship Diagrams

---

### 2.1 System & Tenant Schema
Manages new tenant provisioning, custom domain configurations, and SaaS subscription billing schedules.

```mermaid
erDiagram
  TENANTS {
    uuid id PK
    string store_name
    string subdomain UK
    string custom_domain UK
    enum status
    uuid subscription_plan_id FK
    enum subscription_status
    timestamptz subscription_starts_at
    timestamptz subscription_ends_at
  }
  SUBSCRIPTION_PLANS {
    uuid id PK
    string name
    decimal monthly_price
    decimal yearly_price
    jsonb features
    bool is_active
  }
  SUBSCRIPTION_INVOICES {
    uuid id PK
    uuid tenant_id FK
    decimal amount
    enum status
    timestamptz due_at
  }
  PLATFORM_SETTINGS {
    uuid id PK
    string key UK
    jsonb value
  }
  TENANT_TRAFFIC {
    uuid id PK
    uuid tenant_id FK
    int requests_count
    date day
  }

  SUBSCRIPTION_PLANS ||--o{ TENANTS             : "subscribed by"
  TENANTS ||--o{ SUBSCRIPTION_INVOICES          : "billed"
  TENANTS ||--o{ TENANT_TRAFFIC                : "metered"
```

---

### 2.2 Identity & Role-Based Access Control (RBAC)
Governs authentication, active sessions, and multi-tenant user permission structures.

```mermaid
erDiagram
  USERS {
    uuid id PK
    uuid tenant_id FK
    string name
    string email
    string username
    string password
    enum role
    uuid role_id FK
    uuid branch_id FK
    uuid warehouse_id FK
    string membership_tier
    decimal credit_limit
    bool credit_hold
    int loyalty_points_balance
  }
  ROLES {
    uuid id PK
    uuid tenant_id FK
    string name
    bool is_system_role
    uuid parent_role_id FK
    enum scope_type
  }
  PERMISSIONS {
    uuid id PK
    string code UK
    string module
    string feature
    string action
  }
  ROLE_PERMISSIONS {
    uuid role_id FK
    uuid permission_id FK
  }
  USER_ROLE_ASSIGNMENTS {
    uuid id PK
    uuid user_id FK
    uuid role_id FK
    uuid tenant_id FK
    enum scope_type
    uuid scope_id
  }
  USER_PERMISSION_OVERRIDES {
    uuid id PK
    uuid user_id FK
    uuid permission_id FK
    enum mode
    string reason
  }
  SESSIONS {
    uuid id PK
    uuid user_id FK
    string ip
    timestamptz expires_at
    timestamptz revoked_at
  }
  STAFF_INVITATIONS {
    uuid id PK
    uuid tenant_id FK
    string email
    string token UK
    enum status
    timestamptz expires_at
  }

  USERS ||--o| ROLES                                   : "primary role"
  USERS ||--o{ USER_ROLE_ASSIGNMENTS                   : "assignments"
  ROLES ||--o{ USER_ROLE_ASSIGNMENTS                   : "assigned"
  ROLES ||--o{ ROLE_PERMISSIONS                        : "grants"
  PERMISSIONS ||--o{ ROLE_PERMISSIONS                  : "in"
  USERS ||--o{ USER_PERMISSION_OVERRIDES               : "overrides"
  PERMISSIONS ||--o{ USER_PERMISSION_OVERRIDES         : "overridden"
  USERS ||--o{ SESSIONS                                : "sessions"
```

---

### 2.3 Catalog & Pricing
Defines variant-level configurations, pricing rules across price books, and brand categorization.

```mermaid
erDiagram
  PRODUCTS {
    uuid id PK
    uuid tenant_id FK
    string slug UK
    string sku
    string barcode
    decimal price
    decimal average_cost
    uuid category_id FK
    uuid brand_id FK
  }
  PRODUCT_VARIANTS {
    uuid id PK
    uuid tenant_id FK
    uuid product_id FK
    string sku
    string barcode
    decimal price
    jsonb combination
    bool is_default
  }
  PRODUCT_ATTRIBUTES {
    uuid id PK
    uuid tenant_id FK
    uuid product_id FK
    string name
    jsonb values
  }
  BRANDS {
    uuid id PK
    uuid tenant_id FK
    string name
    string slug
  }
  CATEGORIES {
    uuid id PK
    uuid tenant_id FK
    uuid parent_id FK
    string name
    string slug
  }
  PRICE_BOOKS {
    uuid id PK
    uuid tenant_id FK
    string name
    string currency
    bool is_default
  }
  PRODUCT_PRICES {
    uuid id PK
    uuid price_book_id FK
    uuid variant_id FK
    decimal price
    decimal min_quantity
  }

  PRODUCTS ||--o{ PRODUCT_VARIANTS       : "has"
  PRODUCTS ||--o{ PRODUCT_ATTRIBUTES     : "has"
  BRANDS ||--o{ PRODUCTS                 : "of"
  CATEGORIES ||--o{ PRODUCTS              : "in"
  CATEGORIES }o--o| CATEGORIES             : "parent"
  PRICE_BOOKS ||--o{ PRODUCT_PRICES      : "lines"
  PRODUCT_VARIANTS ||--o{ PRODUCT_PRICES : "priced"
```

---

### 2.4 Sales: Orders, Returns & Payments
Captures customer sales transactions, POS split payment details, and returns processing.

```mermaid
erDiagram
  ORDERS {
    uuid id PK
    uuid tenant_id FK
    uuid user_id FK
    string customer_name
    string customer_email
    decimal total_amount
    decimal shipping_fee
    decimal tax_amount
    decimal coupon_discount_amount
    string applied_coupon
    decimal wallet_deduction_amount
    enum status
    enum order_source
    enum payment_status
    string payment_method
    string transaction_id
    uuid offline_sale_id UK
  }
  ORDER_ITEMS {
    uuid id PK
    uuid tenant_id FK
    uuid order_id FK
    uuid product_id FK
    uuid variant_id FK
    jsonb snapshot
    int quantity
    decimal unit_price
    decimal discount_amount
    decimal tax_amount
    decimal total_amount
  }
  ORDER_RETURNS {
    uuid id PK
    uuid tenant_id FK
    uuid order_id FK
    enum status
    string reason
    decimal total_refunded
  }
  PAYMENTS {
    uuid id PK
    uuid tenant_id FK
    uuid order_id FK
    enum method
    decimal amount
    enum status
    string transaction_id
  }

  ORDERS ||--o{ ORDER_ITEMS             : "lines"
  ORDERS ||--o{ ORDER_RETURNS           : "returned"
  ORDERS ||--o{ PAYMENTS                : "paid by"
```

---

### 2.5 Inventory & Warehouse Management System (WMS)
Tracks append-only physical inventory movements, bin structures, lot details, and stock reservations.

```mermaid
erDiagram
  INVENTORY_LEDGER {
    uuid id PK
    uuid tenant_id FK
    uuid product_id FK
    uuid variant_id FK
    uuid branch_id FK
    uuid warehouse_id FK
    uuid bin_id FK
    enum type
    decimal quantity
    decimal balance_after
    decimal unit_cost
    enum reference_type
    string reference_id
    uuid batch_id FK
  }
  STOCK_RESERVATIONS {
    uuid id PK
    uuid tenant_id FK
    uuid product_id FK
    uuid variant_id FK
    uuid warehouse_id FK
    uuid order_id FK
    decimal reserved_qty
    decimal fulfilled_qty
    decimal released_qty
    enum status
    timestamptz expires_at
  }
  STOCK_TRANSFERS {
    uuid id PK
    uuid tenant_id FK
    string transfer_number
    uuid source_warehouse_id FK
    uuid destination_warehouse_id FK
    enum status
  }
  STOCK_TRANSFER_ITEMS {
    uuid id PK
    uuid transfer_id FK
    uuid product_id FK
    uuid variant_id FK
    decimal qty_requested
    decimal qty_shipped
    decimal qty_received
  }
  PRODUCT_BATCHES {
    uuid id PK
    uuid tenant_id FK
    uuid product_id FK
    uuid variant_id FK
    string batch_number
    date expiry_date
    date manufactured_date
  }

  STOCK_TRANSFERS ||--o{ STOCK_TRANSFER_ITEMS     : "lines"
  STOCK_TRANSFERS ||--o{ INVENTORY_LEDGER        : "writes (OUT then IN)"
```

---

### 2.6 Finance & General Ledger
Implements GAAP compliant financial accounting entries, wallets, and Accounts Receivable (AR) ledgers.

```mermaid
erDiagram
  ACCOUNTS {
    uuid id PK
    uuid tenant_id FK
    string account_code
    string account_name
    enum account_type
    uuid parent_id FK
  }
  JOURNAL_ENTRIES {
    uuid id PK
    uuid tenant_id FK
    timestamptz entry_date
    string description
    string reference_type
    string reference_id
    bool is_reversal
    uuid reversed_journal_entry_id FK
  }
  LEDGER_ENTRIES {
    uuid id PK
    uuid tenant_id FK
    uuid journal_entry_id FK
    uuid account_id FK
    decimal debit_amount
    decimal credit_amount
  }
  AR_LEDGER {
    uuid id PK
    uuid tenant_id FK
    uuid customer_id FK
    decimal debit_amount
    decimal credit_amount
    decimal balance_after
    string reference_id
  }
  WALLET_LEDGER {
    uuid id PK
    uuid tenant_id FK
    uuid customer_id FK
    decimal credit_amount
    decimal debit_amount
    decimal balance_after
    string reference_id
  }
  FISCAL_PERIODS {
    uuid id PK
    uuid tenant_id FK
    string period_name
    date start_date
    date end_date
    bool is_locked
  }

  ACCOUNTS ||--o{ LEDGER_ENTRIES         : "ledger lines"
  JOURNAL_ENTRIES ||--o{ LEDGER_ENTRIES   : "contains"
  JOURNAL_ENTRIES }o--o| JOURNAL_ENTRIES  : "reversed by"
```
