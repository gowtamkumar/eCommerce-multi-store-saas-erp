# ERP User Manual — Procurement Officer (Purchasing & Supplier Management)

**Document Version:** 1.0.0  
**Audience:** Procurement Officers, Purchasing Managers, Supply Chain Coordinators  
**Last Updated:** May 24, 2026  

---

## Overview
This manual covers the full procurement lifecycle — from managing supplier relationships, generating and sending Purchase Orders, verifying deliveries through GRNs, and managing supplier payments. The procurement module enforces a strict **Procure-to-Pay** workflow that prevents unauthorized purchasing and ensures every supplier invoice is verified against actual delivery.

---

## Module 1: Supplier Management

### 1.1 Adding a New Supplier
1.  Go to **Procurement → Suppliers → Add Supplier**
2.  Fill in:
    - **Supplier Name** and **Supplier Code** (unique identifier, e.g., `SUP-DELL-001`)
    - **Tax ID / VAT Number**
    - **Contact Person Name, Email, Phone**
    - **Payment Terms**: e.g., `30` days (Net-30)
    - **Credit Limit**: maximum outstanding AP balance allowed
3.  Click **Save Supplier**

### 1.2 Supplier Portal Access
You can grant your supplier access to a self-service portal where they can:
- View Purchase Orders assigned to them
- Submit delivery confirmations
- See their payment status

To invite a supplier to the portal:
1.  Go to **Procurement → Suppliers → [Supplier] → Portal Access**
2.  Click **Send Portal Invitation**
3.  The supplier receives an email with a login link to `yourstore.com/supplier-portal`

---

## Module 2: Purchase Orders (PO)

### 2.1 Purchase Order Status Flow
```
DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED → CLOSED
                        ↓
                   CANCELLED
```

### 2.2 Creating a Purchase Order
1.  Go to **Procurement → Purchase Orders → New PO**
2.  Select the **Supplier**
3.  Select the **Destination Warehouse** (where goods will be delivered)
4.  Add line items:
    - Search for product variant
    - Enter **Quantity to Order** and confirm the **Unit Cost** (agreed price)
    - Repeat for all items in the order
5.  Review the **PO Total**
6.  Add an **Expected Delivery Date**
7.  Click **Save as Draft**

### 2.3 Sending a Purchase Order to the Supplier
1.  Open the PO → click **Send PO**
2.  Status changes to `SENT`
3.  The system automatically notifies the supplier:
    - If the supplier has portal access: they see the PO in their portal
    - An email copy is also sent to the supplier's registered email

### 2.4 Editing or Cancelling a PO
- **DRAFT** status: fully editable — add/remove items, change quantities
- **SENT** status: can be cancelled only with a reason. Supplier must be informed separately
- **RECEIVED** status: locked — no changes allowed (legally binding record)

---

## Module 3: Receiving Goods (GRN)

When the supplier delivers goods, the warehouse team creates a **Goods Received Note (GRN)**. As a Procurement Officer, your role is to verify the GRN matches the PO and approve it for payment.

### 3.1 Reviewing a GRN
1.  Go to **Procurement → Purchase Orders → [PO] → GRNs Tab**
2.  Click the GRN created by the warehouse team
3.  Verify:
    - `Qty Received` matches what the supplier claims to have shipped
    - `Qty Rejected` is documented with a reason
    - Unit costs match the agreed PO prices

### 3.2 What Happens After GRN Confirmation
Once the warehouse confirms the GRN:
- ✅ Stock is added to the destination warehouse inventory ledger
- ✅ An AP entry is created: the company now owes the supplier for the received goods
- ✅ The PO status updates to `PARTIALLY_RECEIVED` or `RECEIVED` depending on quantities

---

## Module 4: Supplier Invoice & 3-Way Matching

### 4.1 Recording a Supplier Invoice
When the supplier sends their bill (invoice):
1.  Go to **Procurement → Supplier Invoices → Record Invoice**
2.  Select the **Supplier** and link to the **Purchase Order**
3.  Enter:
    - Invoice Number (from the physical invoice)
    - Invoice Date and Payment Due Date
    - Line items with quantities and amounts as billed by the supplier
4.  Click **Save Invoice**

### 4.2 3-Way Matching Process
The system automatically runs a **3-Way Match**:

| Match Point | What is Compared |
| :--- | :--- |
| **PO vs GRN** | Ordered qty vs actually received qty |
| **GRN vs Invoice** | Received qty vs invoiced qty |
| **PO vs Invoice** | Agreed unit price vs invoiced unit price |

Match results:
- ✅ **Matched** — all three align. Invoice can be approved for payment.
- ⚠️ **Quantity Variance** — supplier invoiced more or fewer units than received
- ⚠️ **Price Variance** — supplier invoiced at a different price than agreed in the PO
- ❌ **Mismatch** — significant discrepancy requiring supplier clarification or debit note

### 4.3 Handling a Price or Quantity Discrepancy
If there is a discrepancy:
1.  Contact the supplier to clarify or issue a corrected invoice
2.  If a partial credit is agreed, create a **Debit Note**:
    - Go to **Procurement → Debit Notes → Create Debit Note**
    - Link to the original invoice
    - Enter the amount being disputed/credited back
    - The AP balance is automatically reduced by the debit note amount

---

## Module 5: Supplier Payments

### 5.1 Approving an Invoice for Payment
*Handled by the Finance/Accountant team — refer to the Accountant Manual for detailed steps.*

As a Procurement Officer, your role is to:
1.  Confirm the 3-way match result is accurate
2.  Mark the invoice as **Ready for Payment**

### 5.2 Recording a Supplier Payment
Once the Accountant processes the bank transfer:
1.  Go to **Procurement → Supplier Payments → Record Payment**
2.  Select the supplier and the invoice(s) being paid
3.  Enter **Payment Amount**, **Payment Date**, **Bank Reference**
4.  Click **Record Payment**
5.  The AP subledger balance is reduced automatically

### 5.3 Supplier Ledger (AP Statement)
To see the full account history with a supplier:
1.  Go to **Procurement → Suppliers → [Supplier] → Ledger Tab**
2.  The ledger shows:
    - All GRNs (credit entries — what we owe)
    - All payments made (debit entries — what we have paid)
    - **Running Outstanding Balance** — current amount owed to the supplier

---

## Module 6: Supplier Performance Reports

### 6.1 Supplier Delivery Accuracy Report
**Procurement → Reports → Supplier Performance**
- Shows for each supplier over a date range:
  - Total POs sent
  - On-time delivery rate (%)
  - Quantity accuracy rate (%)
  - Rejection rate (%)

### 6.2 AP Aging Report
**Finance → Reports → AP Aging** (shared with Accountant)
- Shows outstanding supplier invoices grouped by age bucket
- Helps prioritize which suppliers to pay first to avoid credit holds or late penalties

---

## Quick Reference Cheatsheet

| Task | Navigation |
| :--- | :--- |
| Add new supplier | Procurement → Suppliers → Add Supplier |
| Invite supplier to portal | Procurement → Suppliers → [Supplier] → Portal Access → Send Invitation |
| Create purchase order | Procurement → Purchase Orders → New PO |
| Send PO to supplier | Procurement → Purchase Orders → [PO] → Send PO |
| View GRN for a PO | Procurement → Purchase Orders → [PO] → GRNs Tab |
| Record supplier invoice | Procurement → Supplier Invoices → Record Invoice |
| Check 3-way match result | Procurement → Supplier Invoices → [Invoice] → Match Result |
| Create debit note for discrepancy | Procurement → Debit Notes → Create Debit Note |
| Record supplier payment | Procurement → Supplier Payments → Record Payment |
| View supplier outstanding balance | Procurement → Suppliers → [Supplier] → Ledger Tab |
