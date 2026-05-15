# Procurement & Supply Chain Design

This document outlines the design for the Procurement and Supply Chain domain, focusing on the workflows, entities, and integrations required to manage the "buying" side of the business.

---

## 1. Procurement Philosophy
The goal of the procurement system is to ensure:
- **Cost Control**: Tracking purchase prices and supplier terms.
- **Inventory Accuracy**: Verification of goods received vs. goods ordered.
- **Financial Integrity**: Ensuring accounts payable reflect actual goods in hand.
- **Supplier Relationship Management (SRM)**: Evaluating vendor performance.

---

## 2. Core Entities (Database Design)

### 2.1 Supplier
Represents a vendor or manufacturer.
- `id`: UUID
- `name`: string
- `code`: string (Unique vendor code)
- `category`: enum (MANUFACTURER, WHOLESALER, SERVICE_PROVIDER)
- `taxId`: string (VAT/TIN)
- `contactPerson`: string
- `phone`: string
- `email`: string
- `address`: text
- `creditLimit`: decimal
- `paymentTerms`: string (e.g., "Net 30")
- `status`: enum (ACTIVE, BLACKLISTED, ON_HOLD)

### 2.2 Purchase Order (PO)
A formal request to a supplier for goods.
- `id`: UUID
- `poNumber`: string (e.g., `PO-2024-0001`)
- `supplierId`: UUID
- `warehouseId`: UUID (The intended destination for the goods)
- `orderDate`: date
- `expectedDate`: date
- `totalAmount`: decimal
- `status`: enum (DRAFT, PENDING_APPROVAL, SENT, PARTIALLY_RECEIVED, RECEIVED, CLOSED, CANCELLED)
- `notes`: text

### 2.3 Purchase Order Item
Lines within a PO.
- `id`: UUID
- `poId`: UUID
- `productVariantId`: UUID
- `quantityOrdered`: int
- `quantityReceived`: int (Tracked during GRN)
- `unitPrice`: decimal
- `taxAmount`: decimal
- `totalAmount`: decimal

### 2.4 Goods Received Note (GRN)
Confirmation of stock arrival.
- `id`: UUID
- `grnNumber`: string (e.g., `GRN-2024-0001`)
- `poId`: UUID
- `supplierId`: UUID
- `receivedDate`: timestamp
- `receivedBy`: UUID (User ID)
- `notes`: text

### 2.5 GRN Item
Specific items received in a batch.
- `id`: UUID
- `grnId`: UUID
- `productVariantId`: UUID
- `quantityAccepted`: int
- `quantityRejected`: int (Damaged or wrong items)
- `rejectionReason`: text
- `batchNumber`: string (For expiry tracking)
- `expiryDate`: date (For expiry tracking)

### 2.6 Supplier Bill (Invoice)
The financial document from the supplier.
- `id`: UUID
- `billNumber`: string (Supplier's invoice number)
- `poId`: UUID
- `supplierId`: UUID
- `billDate`: date
- `dueDate`: date
- `totalAmount`: decimal
- `status`: enum (UNPAID, PARTIAL, PAID)

---

## 3. The Procurement Workflow

### 3.1 Requisition & PO Creation
1. Inventory manager identifies low stock or manual requirement.
2. Creates a **Purchase Order** selecting a **Supplier** and **Destination Warehouse**.
3. PO is sent to the supplier (email/portal).

### 3.2 Goods Receiving (GRN)
1. Physical goods arrive at the **Warehouse**.
2. Warehouse staff creates a **GRN** linked to the **PO**.
3. For each item, staff records:
    - **Quantity Accepted**: Updates the **Inventory Ledger** (Status: AVAILABLE).
    - **Quantity Rejected**: Logged for credit note or return to supplier.
    - **Batch/Expiry**: Recorded for perishable goods.
4. If `Quantity Received < Quantity Ordered`, the PO remains in `PARTIALLY_RECEIVED` status.

### 3.3 Billing & Accounts Payable
1. Supplier sends an **Invoice**.
2. Finance records a **Supplier Bill** linked to the **PO/GRN**.
3. **Accounting Event**: 
    - Debit: Inventory Asset.
    - Credit: Accounts Payable (Supplier).

### 3.4 Supplier Payment
1. Finance processes payment via Cash, Bank, or Credit.
2. **Accounting Event**:
    - Debit: Accounts Payable.
    - Credit: Bank/Cash.

---

## 4. Advanced Supply Chain Features

### 4.1 Landed Cost Tracking
In many businesses, the "True Cost" of a product includes:
- Product Cost + Shipping + Customs + Handling.
- The system should allow allocating these extra costs to the **Unit Cost** of the received items to calculate accurate **COGS** (Cost of Goods Sold).

### 4.2 Supplier Performance Metrics
Tracking:
- **Lead Time Accuracy**: Did they deliver on the `expectedDate`?
- **Quality Rate**: % of items rejected during GRN.
- **Price Consistency**: History of price fluctuations per item.

### 4.3 Low Stock Auto-PO (Future)
- Automated PO generation based on `lowStockThreshold` set at the Warehouse level.

---

## 5. Security & Internal Controls
- **Three-Way Match**: The system must verify that:
    1. The **PO** matches the price/quantity ordered.
    2. The **GRN** matches the quantity physically received.
    3. The **Supplier Bill** matches the price in the PO and quantity in the GRN.
- **Approval Workflow**: POs above a certain value require "Manager Approval".
