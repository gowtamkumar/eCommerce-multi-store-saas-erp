# ERP Order Process Flow (Order-to-Cash)

This document defines the end-to-end lifecycle of an order in the ERP system, from placement to financial reconciliation.

---

## Step 1: Order Placement (The "Sales" Phase)
- **Actor**: Customer (Online) or Staff (POS).
- **Process**: 
    1. System validates **Price Book** for the customer.
    2. System checks **Available to Promise (ATP)** stock across all warehouses.
- **ERP Actions**: 
    - Create `Order` record.
    - Create `Stock Reservation` in the `inventory_ledger` to "lock" the items.

---

## Step 2: Sourcing & Assignment (The "Logistics" Phase)
- **Actor**: Automated Sourcing Service or Admin.
- **Process**: 
    1. Identify the best Warehouse based on stock and customer proximity.
    2. Handle "Split Shipments" if one warehouse cannot fulfill the entire order.
- **ERP Actions**: 
    - Update `Order.fulfillment_warehouse_id`.
    - Create `FulfillmentTask` record for the assigned warehouse.

---

## Step 3: Picking & Packing (The "Warehouse" Phase)
- **Actor**: Warehouse Staff (Picker/Packer).
- **Process**: 
    1. Staff receives a "Pick List" sorted by **Bin Locations**.
    2. Items are scanned via barcode to ensure 100% accuracy.
    3. Items are placed in a package.
- **ERP Actions**: 
    - Update `FulfillmentTask` status to `PACKED`.

---

## Step 4: Dispatch & Shipping (The "Fulfillment" Phase)
- **Actor**: Shipping Carrier (e.g., FedEx, DHL, Local Van).
- **Process**: 
    1. Package is handed over to the carrier.
    2. Tracking number is generated and sent to the customer.
- **ERP Actions**: 
    - Record `InventoryMovement` (Type: SALE, Quantity: Negative).
    - Release/Delete the `Stock Reservation`.
    - **Accounting Entry (Automated)**:
        - **Debit**: Cost of Goods Sold (Expense).
        - **Credit**: Inventory Asset (Asset).

---

## Step 5: Invoicing & Payment (The "Financial" Phase)
- **Actor**: System / Accountant.
- **Process**: 
    1. Generate a legal `Invoice`.
    2. **Retail**: Payment is immediate.
    3. **Wholesale**: Payment is recorded against the customer's **Credit Balance**.
- **ERP Actions**: 
    - **Accounting Entry (Automated)**:
        - **Debit**: Cash at Bank (Asset).
        - **Credit**: Sales Revenue (Revenue).

---

## Order Status Lifecycle Table

| Status | Business Meaning | Technical/Financial Impact |
| :--- | :--- | :--- |
| **DRAFT** | In Cart / Checkout started. | None. |
| **CONFIRMED** | Order placed & payment verified. | **Soft Stock Reservation** created. |
| **SOURCED** | Warehouse assigned. | Fulfillment task assigned to a location. |
| **PICKING** | Staff is in the aisles. | No financial impact yet. |
| **SHIPPED** | Item left the building. | **Stock Deducted.** COGS recorded. |
| **PAID** | Money confirmed in bank. | Accounts Receivable cleared. Revenue recorded. |

---

## Summary of Senior Engineering Principles:
1. **Never Oversell**: Always reserve stock the moment an order is confirmed.
2. **Audit Everything**: Track who picked the item and from which bin.
3. **Automated Bookkeeping**: No human should manually record the "Cost of Goods Sold". The system handles it the moment the item is shipped.
