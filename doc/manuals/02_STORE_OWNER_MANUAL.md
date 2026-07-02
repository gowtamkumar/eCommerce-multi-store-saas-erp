# ERP User Manual — Store Owner / Business Manager

**Document Version:** 1.0.0  
**Audience:** Business Owners, CEO, CFO, General Managers  
**Last Updated:** May 24, 2026  

---

## Overview
As the **Store Owner**, you are responsible for configuring and managing your entire ERP environment — from registering your company structure, setting up branches and warehouses, onboarding staff, managing your product catalog, and reviewing financial performance. This manual walks you through each of these operational areas step-by-step.

---

## Module 1: Initial Company Setup

### 1.1 Setting Up Your Business Profile
1.  Log in at `https://yourstore.yourplatform.com/admin`
2.  Go to **Settings → Site Settings**
3.  Fill in:
    - **Brand Name** — your business name as it appears to customers
    - **Contact Email & Phone** — used for order notifications
    - **Business Address** — included on printed invoices
    - **Logo** — upload your brand logo (PNG/WebP, recommended 512×512px)
4.  Click **Save Settings**

### 1.2 Configuring Currency & Payment
1.  Go to **Settings → Site Settings → Currency & Payment**
2.  Set your **Primary Currency** (e.g., `BDT`) and **Currency Symbol** (e.g., `৳`)
3.  To support multiple currencies (if on Pro or Enterprise plan):
    - Click **Add Currency** and enter code, symbol, and the live exchange rate vs. your base currency
    - Customers can switch currencies via the storefront Currency Switcher widget
4.  Configure your **Payment Gateway** (SSLCommerz) by entering your Store ID and Store Password in the Payment tab

### 1.3 Setting Up Branches
Branches represent your physical store locations (showrooms, counters, service desks).

1.  Go to **Organization → Branches → Add Branch**
2.  Enter:
    - Branch Name (e.g., `Mirpur Store`, `Gulshan Showroom`)
    - Branch Type: `RETAIL`, `OFFICE`, or `HQ`
    - Physical Address and Contact Phone
3.  Click **Create Branch**
4.  Repeat for each physical location

### 1.4 Setting Up Warehouses
Warehouses store your physical inventory. A warehouse can serve one or multiple branches.

1.  Go to **Organization → Warehouses → Add Warehouse**
2.  Enter:
    - Warehouse Name (e.g., `Central Fulfillment Center`, `Airport Transit Hub`)
    - Warehouse Type: `MAIN`, `TRANSIT`, or `RETURN`
    - Physical Address
3.  Click **Create Warehouse**
4.  To link a warehouse to a specific branch, go to the Branch detail page → **Linked Warehouses → Assign**

---

## Module 2: Staff Onboarding & Role Management

### 2.1 Inviting a Staff Member
1.  Go to **HRM → Staff → Invite New Member**
2.  Enter their email address and select their base role template:
    - `Branch Manager` — can manage a specific branch's operations and reports
    - `Cashier` — restricted to POS terminal operations
    - `Accountant` — access to finance, GL, AP/AR, payroll (view-only by default)
    - `Inventory Manager` — full access to stock management and adjustments
    - `Procurement Officer` — can create POs and manage suppliers
3.  Select their **Branch Scope** (which branches they can access) and **Warehouse Scope**
4.  Click **Send Invitation** — the staff member receives a secure link to set their password

### 2.2 Creating Custom Security Roles
For fine-grained access control beyond the pre-set templates:

1.  Go to **Settings → Roles → Create Custom Role**
2.  Give the role a name (e.g., `Senior Cashier` or `Regional Finance Lead`)
3.  Under **Permissions**, individually enable or disable fine-grained actions:
    - `pos:override-price` — allow cashier to manually edit item price at checkout
    - `catalog:edit-price` — allow editing product prices
    - `inventory:adjust` — allow creating stock adjustment entries
    - `hrm:approve-payroll` — allow approving payroll batches
4.  Click **Save Role**
5.  Assign this role to staff by going to **HRM → [Staff Member] → Change Role**

---

## Module 3: Catalog Management

### 3.1 Adding a Product
1.  Go to **Catalog → Products → Add Product**
2.  Fill in:
    - Product Name, Description, Category, Brand
    - Tax Category (which VAT/GST rate applies)
    - Low Stock Threshold (e.g., `10` units — triggers low-stock alert badge)
3.  Under **Variants**, add specific SKU combinations (e.g., Color: Blue, Size: M):
    - Set Purchase Price (cost from supplier) and Retail Price (selling price)
    - Optionally add a barcode number
4.  Upload product images
5.  Click **Publish Product**

### 3.2 Setting Up Wholesale Price Books
For B2B customers who receive discounted prices based on volume:

1.  Go to **Catalog → Price Books → Create Price Book**
2.  Name the price book (e.g., `Wholesale Tier 1`, `VIP Retail`)
3.  Under **Product Prices**, search for a product variant and set:
    - `Min Quantity` (e.g., `1` for all quantities, or `50` to apply only for 50+ units)
    - `Custom Price` (the discounted unit price)
4.  Assign a price book to a specific customer by going to **Customers → [Customer] → Price Book**

### 3.3 Batch & Expiry Tracking (Pharmacy / Food Businesses)
1.  When receiving stock via a **Purchase Order → GRN**, enable **Batch Tracking** for the product
2.  Enter the **Batch/Lot Number**, **Manufactured Date**, and **Expiry Date**
3.  The system automatically applies **FEFO (First Expired, First Out)** rules during POS checkout and online order fulfillment

---

## Module 4: Financial Overview & Reports

### 4.1 Reading the Main Dashboard
Navigate to **Dashboard** to see real-time KPIs:

| Widget | What to Watch |
| :--- | :--- |
| **Today's Revenue** | Total sales (POS + online) for today |
| **Low Stock Alerts** | Products below their threshold — reorder urgently |
| **Pending POs** | Purchase orders awaiting delivery |
| **7-Day Sales Chart** | Visual trend of revenue by day |
| **Top Products** | Best-selling items this month |

### 4.2 Profit & Loss Report
1.  Go to **Finance → Reports → Profit & Loss**
2.  Select date range (e.g., `This Month`, `This Quarter`, `Custom Range`)
3.  Optionally filter by Branch for location-specific P&L
4.  The report shows:
    - **Revenue**: Total gross sales
    - **Cost of Goods Sold (COGS)**: Supplier purchase cost of sold items
    - **Gross Profit**: Revenue minus COGS
    - **Operating Expenses**: Salaries, utilities, rent entered as expenses
    - **Net Profit**: The bottom line

### 4.3 Exporting Financial Data
1.  Go to **Finance → Reports → Export**
2.  Select report type: Sales, Cash Flow, Expense Summary, or Supplier Ledger
3.  Choose format: **CSV** (for Excel) or **PDF**
4.  Click **Download**

---

## Quick Reference Cheatsheet

| Task | Navigation Path |
| :--- | :--- |
| Add a new branch | Organization → Branches → Add Branch |
| Invite new staff member | HRM → Staff → Invite New Member |
| Create custom security role | Settings → Roles → Create Custom Role |
| Add new product | Catalog → Products → Add Product |
| Create price book for wholesale | Catalog → Price Books → Create Price Book |
| View Profit & Loss Report | Finance → Reports → Profit & Loss |
| Export financial CSV | Finance → Reports → Export |
