# ERP Procurement & Supply Chain Module Guideline

## Domain Boundaries
The Procurement module manages the entire lifecycle of acquiring goods and services from external vendors. It interfaces with:
- **Inventory**: To receive goods and update stock levels.
- **Finance**: To manage Accounts Payable (AP) and General Ledger (GL) entries.
- **Organization**: To scope purchases to specific branches and warehouses.

## Core Entities & Workflows

### 1. Supplier Relationship Management (SRM)
- **Supplier**: Central vendor registry.
- **Supplier Categories**: Grouping by material/service type.
- **Performance Index**: Automated calculation of `On-Time Delivery %` and `Order Fulfillment %`.

### 2. Sourcing Lifecycle
- **Purchase Requisition (PR)**:
  - Triggered by Warehouse Managers or automated Reorder Point (ROP) logic.
  - Requires Budget Approval before conversion to PO.
- **Request for Quotation (RFQ)**:
  - Multi-supplier bidding.
  - Selection criteria: Price, Lead Time, Quality Score.

### 3. Execution & Receiving
- **Purchase Order (PO)**: 
  - Legally binding document sent to the supplier.
  - Must track `Quantity Ordered` vs `Quantity Received`.
- **Goods Received Note (GRN)**:
  - Physical inspection and stock intake.
  - Statuses: `DRAFT`, `RECEIVED`, `REJECTED_PARTIAL`.

### 4. Financial Settlement
- **Supplier Invoice**: Matching the PO, GRN, and Invoice (3-Way Matching).
- **Debit Note**: Formal documentation for returns and credit adjustments.

## Multi-Store Security Rules
- All procurement records MUST contain `store_id`.
- PR/PO approvals must be scoped to the user's assigned branch or the main store admin.
- Supplier lists can be shared globally across a store's branches but never across different stores.

## Integration Points
- **Audit Log**: Every status change (e.g., PO Draft -> Approved) MUST be logged.
- **Notifications**: Alert suppliers on PO issuance and finance on invoice receipt.
- **Ledger**: Automated double-entry bookkeeping for every purchase event.
