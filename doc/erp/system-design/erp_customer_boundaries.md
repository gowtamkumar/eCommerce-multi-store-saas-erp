# ERP Customer Management & Boundaries

This document defines how **Customers** (Retail and Wholesale) are managed within the ERP and how their operational boundaries are enforced.

---

## 1. Customer vs. Staff
In your project, both are stored in the `users` table, but they have different boundaries:
- **Staff**: Have **Access Boundaries** (What they can do/see in the admin).
- **Customers**: Have **Relationship Boundaries** (What prices they see and how they pay).

---

## 2. Customer Boundaries

### A. The Tenant Boundary
*   **Definition**: Every customer belongs to exactly one `Tenant`.
*   **Enforcement**: Handled by the `tenant_id` on the `UserEntity`.
*   **Rule**: A customer cannot log into "Store B" using credentials from "Store A".

### B. The Branch Boundary (Marketing)
*   **Definition**: The "Home Branch" where the customer primarily shops or was registered.
*   **Purpose**: Allows Branch Managers to see their local customer base and run targeted promotions.
*   **Field**: `preferred_branch_id` (pointing to a Branch).

### C. The Commercial Boundary (Pricing & Credit)
*   **Definition**: Distinguishes between individual buyers (Retail) and business partners (Wholesale).
*   **Retail Boundary**: Standard catalog prices, immediate payment.
*   **Wholesale Boundary**: Discounted price books, credit limits, and Net-30 payment terms.
*   **Fields**: `customer_type`, `price_book_id`, `credit_limit`.

---

## 3. The Customer Lifecycle in ERP

### Stage 1: Acquisition
Customers enter the system via:
1.  **Online Registration**: (Handled by the storefront).
2.  **POS Registration**: (Handled by a Branch staff member).
3.  **Manual Lead Conversion**: (Admin converts a `Lead` to a `User`).

### Stage 2: Classification
An Admin (Tenant Owner) reviews the customer and assigns them a "Type":
- If **Wholesale**, they are assigned a specific **Price Book** (e.g., "Wholesale - Gold Tier").
- They are given a **Credit Limit** if they are allowed to buy without immediate payment.

### Stage 3: Operation
When a customer logs in:
1.  The system checks their `price_book_id`.
2.  The Catalog shows prices from that specific price book instead of the default.
3.  During checkout, if they are Wholesale, they see a "Pay on Account" option (up to their credit limit).

---

## 4. Required Database Extensions

To support these boundaries, the following fields are recommended for your `UserEntity` (where `role = 'user'`):

| Field | Type | Description |
| :--- | :--- | :--- |
| `customer_type` | Enum | `RETAIL` or `WHOLESALE`. |
| `preferred_branch_id` | UUID | Links the customer to a specific store location. |
| `price_book_id` | UUID | Links the customer to a specific pricing tier. |
| `credit_limit` | Decimal | The maximum amount they can owe the business. |
| `credit_terms` | Integer | Number of days allowed for payment (e.g., 30). |
