# ERP User Manual — Inventory & Warehouse Manager

**Document Version:** 1.0.0  
**Audience:** Inventory Managers, Warehouse Supervisors, Stock Controllers  
**Last Updated:** May 24, 2026  

---

## Overview
This manual covers all stock management operations — receiving goods from suppliers, performing stock adjustments, managing inter-warehouse transfers, running cycle counts, and reading inventory reports. The system uses an **immutable ledger model**: every stock change (in or out) creates a permanent log entry, ensuring full auditability at all times.

> **Golden Rule:** You never edit a product's "stock number" directly. Instead, every change — purchase, sale, adjustment, transfer — creates a new ledger entry. The current stock level is calculated as the sum of all those entries.

---

## Module 1: Understanding Your Warehouse Dashboard

### 1.1 Main Inventory Overview
1.  Go to **Inventory → Overview**
2.  The dashboard shows:

| Widget | What it Shows |
| :--- | :--- |
| **Total SKUs** | Number of distinct product variants tracked |
| **Low Stock Alerts** | Products below their `low_stock_threshold` |
| **In-Transit Stock** | Units currently in approved stock transfers |
| **Expiring Soon** | Batch lots expiring within 30 days |
| **Stock Value** | Total value of inventory (units × purchase price) |

### 1.2 Checking Stock Levels for a Product
1.  Go to **Inventory → Products**
2.  Search by product name or SKU
3.  Click the product to open the detail view
4.  Under the **Stock** tab, see:
    - **Available Stock** per warehouse (on-hand minus active reservations)
    - **Reserved Stock** (held for pending orders)
    - **In-Transit Stock** (currently in a transfer document)
    - **Transaction History** — every ledger entry ever recorded for this variant

---

## Module 2: Receiving Stock (GRN — Goods Received Note)

A **Goods Received Note (GRN)** is the official document created when a supplier's delivery arrives at your warehouse. This is the only way to increase stock legitimately — never adjust stock manually for supplier deliveries.

### 2.1 GRN Workflow
```
Purchase Order (SENT) → Supplier Ships → Create GRN → Verify Quantities → Confirm GRN → Stock Ledger Updated
```

### 2.2 Steps to Create a GRN
1.  Go to **Inventory → GRN → Create GRN**
2.  Select the linked **Purchase Order** from the dropdown
3.  The GRN auto-populates the ordered items and quantities from the PO
4.  Physically count the arriving goods and fill in:
    - **Qty Received** — actual units that arrived
    - **Qty Rejected** — units refused (damaged, wrong item, wrong spec)
    - **Unit Cost** — confirm the agreed price matches the delivery note
5.  For batch-tracked products (pharmacy, food), enter:
    - **Batch Number** (from supplier's packaging)
    - **Manufacturing Date**
    - **Expiry Date**
6.  Select the **Destination Warehouse** and optionally a specific **Bin location**
7.  Click **Confirm GRN**

**What happens automatically:**
- ✅ A positive `PURCHASE` entry is written to the inventory ledger
- ✅ The Accounts Payable subledger is updated (supplier is now owed money)
- ✅ A balanced journal entry is posted: `DR Inventory Asset / CR Accounts Payable`

---

## Module 3: Stock Transfers (Inter-Warehouse Movement)

### 3.1 When to Use a Stock Transfer
Use a transfer when you need to move physical inventory from one warehouse to another — for example, from the **Central Warehouse** to a **Retail Branch Warehouse** to replenish counter stock.

### 3.2 Transfer Status Flow
```
DRAFT → APPROVED → IN_TRANSIT → RECEIVED
              ↓
          CANCELLED
```

### 3.3 Creating a Transfer
1.  Go to **Inventory → Stock Transfers → New Transfer**
2.  Select **Source Warehouse** (where stock is coming from)
3.  Select **Destination Warehouse** (where stock is going to)
4.  Add the items to transfer:
    - Search for product variant
    - Enter the quantity to transfer
    - The system checks **Available Stock** at the source — you cannot transfer more than what's available
5.  Click **Save as Draft**

### 3.4 Approving and Dispatching a Transfer
*Requires `inventory:transfer-approve` permission.*
1.  Go to **Inventory → Stock Transfers → [Transfer ID]**
2.  Review the items and quantities
3.  Click **Approve** — status changes to `APPROVED`
4.  When the goods are physically dispatched, click **Mark as In-Transit**
5.  The system posts a `TRANSFER_OUT` entry on the source warehouse ledger — stock is deducted from source but has **not yet arrived** at destination

### 3.5 Receiving a Transfer at Destination
1.  At the destination warehouse, go to **Inventory → Stock Transfers → In-Transit**
2.  Click the transfer and physically verify the received quantities
3.  Click **Confirm Receipt**
4.  The system posts a `TRANSFER_IN` entry on the destination warehouse ledger — stock is now available at destination

---

## Module 4: Stock Adjustments

Stock adjustments correct discrepancies between the system count and the physical count. Common reasons: damage, theft, expiry write-off, miscounting, or system error.

> **All adjustments require a reason code and are logged permanently in the audit trail. Adjustments above a configured threshold require a second approval.**

### 4.1 Creating a Stock Adjustment
1.  Go to **Inventory → Adjustments → New Adjustment**
2.  Select the **Warehouse** and **Bin** (optional)
3.  Search for the product variant
4.  Enter the **Adjustment Quantity**:
    - Positive number = adding stock (e.g., `+10` — found extra units)
    - Negative number = removing stock (e.g., `-5` — 5 units were damaged)
5.  Select a **Reason Code**:
    - `DAMAGE` — physically damaged goods written off
    - `EXPIRY` — expired batch disposed of
    - `THEFT` — confirmed theft or shrinkage
    - `COUNTING_ERROR` — physical count was previously wrong
    - `SYSTEM_CORRECTION` — data entry correction
6.  Enter a written **Explanation** (mandatory)
7.  Click **Submit Adjustment** — if approval is required, status is `PENDING_APPROVAL`

### 4.2 Approving a Pending Adjustment
*Requires `inventory:adjust-approve` permission — typically Branch Manager or Inventory Manager.*
1.  Go to **Inventory → Adjustments → Pending Approval**
2.  Review the adjustment details and the stated reason
3.  Click **Approve** or **Reject** with a manager note

---

## Module 5: Cycle Counts (Physical Inventory Audit)

A **Cycle Count** is a periodic count of a subset of inventory — you don't need to count everything at once. You can schedule counts by category, zone, or warehouse.

### 5.1 Scheduling a Cycle Count
1.  Go to **Inventory → Cycle Counts → Schedule Count**
2.  Select the **Warehouse** and optionally filter by **Category** or **Zone/Bin**
3.  Set the **Scheduled Date**
4.  Assign the count to a **Warehouse Staff Member**
5.  Click **Schedule**

### 5.2 Executing the Count
1.  The assigned staff goes to **Inventory → Cycle Counts → My Tasks**
2.  Opens the count and physically counts each listed item
3.  Enters the **Physical Count** for each product variant
4.  Clicks **Submit Count**

### 5.3 Reviewing Variances
1.  Go to **Inventory → Cycle Counts → [Count ID] → Review Variances**
2.  The system compares the physical count vs. the system count
3.  Items with variances are highlighted:
    - 🔴 **Short** — physical count is less than system count (loss, theft, damage)
    - 🟡 **Over** — physical count is more than system count (found goods, entry error)
4.  Click **Apply Adjustments** — this auto-creates adjustment entries for all variances with reason code `CYCLE_COUNT`

---

## Module 6: Batch & Expiry Management

### 6.1 Viewing Expiring Batches
1.  Go to **Inventory → Batches → Expiry Alert**
2.  Filter by warehouse and timeframe (e.g., `Expiring in 30 days`)
3.  The list shows all batch lots approaching expiry with:
    - Batch number, product name, expiry date, warehouse location
    - **Remaining Qty** in that batch
4.  Action options:
    - **Prioritize Sales** — flag this batch for FEFO-priority during POS checkout
    - **Write Off** — create an adjustment to remove expired units

### 6.2 How FEFO Works at Checkout
When a cashier scans a batch-tracked product at POS, the system **automatically selects the batch with the earliest expiry date first**. The cashier does not need to choose — FEFO (First Expired, First Out) is enforced silently in the background.

---

## Module 7: Inventory Reports

### 7.1 Stock Valuation Report
**Inventory → Reports → Stock Valuation**
- Shows total inventory value per warehouse calculated as:
  `Sum of (units_on_hand × weighted_average_purchase_cost)`

### 7.2 Stock Movement Report
**Inventory → Reports → Stock Movements**
- Full audit log of every IN and OUT transaction for any product over a date range
- Filter by: Product, Warehouse, Transaction Type, Date

### 7.3 Low Stock Report
**Inventory → Reports → Low Stock**
- Lists all variants where `available_stock < low_stock_threshold`
- Use this to trigger purchase orders before stock-outs occur

---

## Quick Reference Cheatsheet

| Task | Navigation |
| :--- | :--- |
| Check stock levels for a product | Inventory → Products → [Product] → Stock Tab |
| Create GRN for supplier delivery | Inventory → GRN → Create GRN |
| Create inter-warehouse transfer | Inventory → Stock Transfers → New Transfer |
| Approve and dispatch a transfer | Inventory → Stock Transfers → [Transfer] → Approve → In-Transit |
| Receive a transfer at destination | Inventory → Stock Transfers → In-Transit → Confirm Receipt |
| Create a stock adjustment | Inventory → Adjustments → New Adjustment |
| Schedule a cycle count | Inventory → Cycle Counts → Schedule Count |
| View expiring batches | Inventory → Batches → Expiry Alert |
| View stock valuation | Inventory → Reports → Stock Valuation |
