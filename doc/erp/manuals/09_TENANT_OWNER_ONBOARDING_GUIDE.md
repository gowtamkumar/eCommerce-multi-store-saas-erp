# ERP Tenant Owner Onboarding Guide

This guide is designed for the **Tenant Owner** (the business owner or system administrator) who is responsible for the initial setup and configuration of the entire ERP environment.

---

## The Owner's Mission
As the Tenant Owner, your goal is to transition your business data into the ERP so that your staff can begin daily operations. You are the only user with "Global" access to financials and organizational settings.

---

## Step 1: Physical Infrastructure Setup
*Before anything else, you must define where your business happens.*

1.  **Define Branches**: Add all your retail stores or sales offices.
2.  **Define Warehouses**: Add your storage facilities. 
    *   *Tip:* Even if you sell from your store, create a "Main Warehouse" that represents the store's back-room.
3.  **Define Bins**: (Optional but Recommended) Set up rows and shelves in your warehouse for faster picking.

---

## Step 2: Financial Foundation
*This is the "Brain" of your ERP. It must be set up correctly to track profit.*

1.  **Currency & Timezone**: Confirm your primary operating currency.
2.  **Chart of Accounts (COA)**: 
    *   The system will auto-generate a standard list of accounts (Cash, Inventory, Revenue).
    *   Review these and add any custom bank accounts you use.
3.  **Fiscal Year**: Set your accounting start date (e.g., January 1st).

---

## Step 3: Catalog & Stock Import
*Moving your products into the system.*

1.  **Product Master**: Import your products via CSV. 
2.  **Price Lists**: Set your Retail and Wholesale prices.
3.  **Opening Stock**: This is your "Day 1" count. 
    *   Go to each Warehouse and record exactly how much stock you have.
    *   *System Action:* This creates your first "Inventory Asset" value in accounting.

---

## Step 4: Human Resources (Team Setup)
*Getting your staff ready to work.*

1.  **Invite Staff**: Send invitations to your employees.
2.  **Location Assignment**: 
    *   Assign your Cashiers to specific **Branches**.
    *   Assign your Pickers/Packers to specific **Warehouses**.
3.  **Permissions**: Ensure staff only see what they need (e.g., Cashiers shouldn't see Warehouse stock levels in other cities).

---

## Step 5: Supplier & Procurement
*Setting up your supply chain.*

1.  **Supplier Directory**: Add the companies you buy stock from.
2.  **Tax Settings**: Configure your VAT/Sales tax rates so they are automatically calculated on every sale and purchase.

---

### Dashboard Checklist for the Owner
The system will guide you with a "Setup Progress" bar. You are ready to go when:
- [ ] At least 1 Branch & Warehouse are active.
- [ ] Your Chart of Accounts is initialized.
- [ ] Your opening stock is recorded.
- [ ] Your first staff member is invited.
