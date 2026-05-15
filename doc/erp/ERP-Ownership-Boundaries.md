# ERP Ownership & Data Boundaries Analysis

This analysis defines the strict boundaries between **Tenant**, **Branch**, and **Warehouse** domains.

---

### Step 1: The Identity & Access Boundary
**Owner:** Tenant
*   **Definition:** Users belong to the **Tenant**, but are *assigned* to a **Branch** or **Warehouse**.
*   **Constraint:** A staff member at "Branch A" should never be able to see the POS transactions of "Branch B" unless they have a "Global Manager" role.
*   **Key Field:** `user.current_assignment_id` (pointing to either a Branch or Warehouse).

---

### Step 2: The Catalog Boundary (Global Data)
**Owner:** Tenant (Shared)
*   **Definition:** Products, Variants, Categories, and Brands are **Global**.
*   **Rule:** You don't create a "Product" for a specific branch. All branches sell from the same master catalog.
*   **Exceptions:** Pricing can be Branch-specific via `PriceBooks`.

---

### Step 3: The Inventory Boundary (Physical Assets)
**Owner:** Warehouse
*   **Definition:** Stock "Live" quantities and Bin locations are **100% owned by the Warehouse**.
*   **Rule:** A Branch does NOT own stock directly. If a Branch has a "Shelf" with products, that shelf must be modeled as a **Mini-Warehouse** or a **Stock Location** linked to that Branch.
*   **Key Action:** Any movement between a Warehouse and a Branch is a `StockTransfer` (a formal document).

---

### Step 4: The Commerce & Sales Boundary (Revenue)
**Owner:** Branch
*   **Definition:** Orders, POS Sessions, and Refunds are **owned by the Branch**.
*   **Rule:** When an online order is placed, it is "Unassigned" until a Sourcing Service assigns it to a **Warehouse** for fulfillment.
*   **Audit Trail:** An order must record: `sold_at_branch_id` and `fulfilled_from_warehouse_id`.

---

### Step 5: The Procurement Boundary (Cost)
**Owner:** Warehouse (usually)
*   **Definition:** Purchase Orders and Goods Received Notes (GRN).
*   **Rule:** Since stock physically arrives at a Warehouse, the Warehouse staff "owns" the GRN process. 
*   **Financial Impact:** The moment a Warehouse staff clicks "Verify GRN", the **Tenant's** Accounts Payable increases.

---

### Step 6: The Accounting Boundary (The Aggregator)
**Owner:** Tenant
*   **Definition:** General Ledger, Chart of Accounts, and Tax Reporting.
*   **Rule:** Accounting is the only module that "sees" everything. It listens to events from both Branches (Revenue) and Warehouses (Asset Value) to create a consolidated financial picture.

---

## Summary Ownership Table

| Module | Primary Owner | Secondary Access |
| :--- | :--- | :--- |
| **POS / Sales** | Branch | Tenant (Admin) |
| **Stock Levels** | Warehouse | Branch (View Only) |
| **Expenses** | Branch | Tenant (Finance) |
| **PO / Receiving** | Warehouse | Tenant (Procurement) |
| **Customer Data** | Tenant (Shared) | Branch (Local History) |
| **Payroll** | Tenant (HR) | Branch (Attendance Data) |
