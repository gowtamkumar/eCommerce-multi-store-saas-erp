# ERP User Manual — Retail POS Cashier & Sales Staff

**Document Version:** 1.0.0  
**Audience:** Store Cashiers, Counter Operators, Retail Sales Staff  
**Last Updated:** May 24, 2026  

---

## Overview
This manual guides you through the daily operations of the **Point of Sale (POS)** terminal. As a cashier, your primary tools are the checkout screen, barcode scanner, and cash drawer. This system is designed to be fast, reliable, and continue working even if the internet connection drops.

> **Golden Rule for Cashiers:** Never close the browser tab during an active shift. All your sales are saved locally and will sync to the server automatically.

---

## Module 1: Starting Your Shift (Opening the Till)

Every working day begins with opening your register. This creates a financial record of how much cash was in the drawer before you started selling.

### Steps to Open a Shift
1.  Navigate to `https://yourstore.com/admin/pos` and log in with your cashier credentials
2.  The system automatically prompts you with the **"Open Shift"** dialog
3.  Count the physical cash in your drawer and enter the **Opening Cash Balance** (e.g., `৳5,000.00`)
4.  Click **Open Shift & Start Selling**
5.  You are now on the main POS screen

> If your opening balance does not match what the previous shift closed with, immediately notify your Branch Manager before proceeding.

---

## Module 2: Processing a Sale

### 2.1 Adding Items to the Cart
**Method 1 — Barcode Scanner (Recommended):**
- Focus cursor in the search bar (it is auto-focused when the POS loads)
- Scan the product barcode with your scanner gun
- The item appears in the cart instantly with a beep sound

**Method 2 — Manual Product Search:**
- Type the product name or SKU in the search box
- Select the correct variant from the dropdown list

**Method 3 — Quick Category Browse:**
- Click a category tile on the left panel to browse products visually

### 2.2 Adjusting Quantities & Applying Discounts
- **Change Quantity:** Click the item in the cart → tap `+` or `-` or type the exact number
- **Apply Item Discount:** Click the item → select **Discount** → enter a fixed amount (e.g., `৳50`) or a percentage (e.g., `10%`)
  - *Note: The `pos:override-price` permission is required for manual price edits. If you don't see this option, contact your manager.*
- **Apply Coupon Code:** Click **Coupon** at the top of the cart → enter the code → click **Apply**

### 2.3 Assigning a Customer
To record the sale against a specific customer account (required for wallet payments or loyalty points):
1.  Click **Assign Customer** at the top of the POS screen
2.  Search by name, phone, or customer code
3.  Click the customer's name to link them to this sale
4.  Their loyalty points balance and wallet balance will be visible

### 2.4 Taking Payment — Single Payment
1.  Click the green **Charge** button
2.  Select the payment method: **Cash**, **Card**, **Mobile Banking (bKash/Nagad)**, or **Customer Wallet**
3.  For **Cash payments**: enter the amount tendered by the customer → the system calculates and displays the change amount
4.  Click **Complete Sale**
5.  The receipt prints automatically (or displays as QR for digital receipt)

### 2.5 Taking Payment — Split Tender
When a customer pays with multiple methods (e.g., part bKash, part cash):
1.  Click **Charge** → then click **Split Payment**
2.  For the first payment method, enter the partial amount (e.g., `৳800 via bKash`)
3.  Click **Add Another Payment**
4.  Enter the remaining amount for the second method (e.g., `৳200 cash`)
5.  Verify the total equals the cart total
6.  Click **Complete Sale**

---

## Module 3: Working Offline (No Internet)

The POS is designed as **Offline-First**. If your internet drops:

1.  A yellow **"Offline Mode"** banner appears at the top of the screen
2.  Continue processing sales normally — all transactions are saved in your browser's local storage
3.  When internet is restored, the banner changes to **"Syncing..."** and all offline sales are automatically uploaded to the server
4.  You will see a green **"Sync Complete"** notification

> **Important:** Do not close or refresh the browser while the sync banner is active. Wait for the "Sync Complete" message.

---

## Module 4: Processing Returns & Exchanges

### 4.1 Standard Return (Refund to Customer Wallet)
1.  Click **Returns** in the top menu
2.  Search for the original receipt by **Order ID** or **Customer Phone Number**
3.  Select the items being returned (you can partially return a multi-item order)
4.  Choose the return reason from the dropdown
5.  Select refund method:
    - **Store Credit (Customer Wallet)** — recommended, instant
    - **Cash Refund** — for cash-paid orders
6.  Click **Process Return**
7.  Stock is automatically restocked in the warehouse

### 4.2 Exchange (Return + New Sale)
1.  Follow steps 1–4 of the Standard Return above
2.  Instead of refunding, click **Exchange Items**
3.  Add the new replacement items to the exchange cart
4.  If the new items cost more, collect the difference; if less, issue store credit for the balance
5.  Click **Complete Exchange**

---

## Module 5: Cash Drawer Operations (Mid-Day)

During a shift, you may need to add or remove cash from the drawer for legitimate reasons.

### 5.1 Cash-In (Adding Cash to Drawer)
*Use case: Manager adds change float to the drawer*
1.  Click **Drawer** in the top menu → **Cash In**
2.  Enter the amount being added (e.g., `৳2,000`)
3.  Enter the reason (e.g., `Change float from manager`)
4.  Click **Record Cash In**

### 5.2 Cash-Out (Removing Cash from Drawer)
*Use case: Sending cash to the safe, or expense payment*
1.  Click **Drawer** → **Cash Out**
2.  Enter the amount being removed
3.  Enter the reason (e.g., `Cash transfer to safe`)
4.  Click **Record Cash Out**

> All drawer operations are permanently recorded and visible to your Branch Manager.

---

## Module 6: Closing Your Shift (End of Day)

Closing a shift creates a reconciliation record comparing expected cash (calculated from sales) with the actual physical cash in your drawer.

### Steps to Close a Shift
1.  Click **Close Shift** from the top menu
2.  Count the physical cash in your drawer carefully
3.  Enter the **Actual Closing Cash** amount
4.  The system displays:
    - **Expected Cash**: Opening balance + all cash sales + cash-ins − cash-outs
    - **Variance**: Difference between expected and actual
5.  If there is a variance, select a reason from the dropdown (e.g., `Counting Error`, `Counterfeit Bill`)
6.  Click **Close & Submit Shift**
7.  Print the **Z-Report** (end-of-day sales summary) for your records

---

## Quick Reference Cheatsheet

| Task | Action |
| :--- | :--- |
| Open shift | POS loads automatically → Enter opening cash → Open Shift |
| Scan barcode | Focus on search bar → Scan with scanner gun |
| Apply coupon | Click Coupon → Enter code → Apply |
| Split payment | Charge → Split Payment → Add multiple amounts |
| Process return | Returns → Search receipt → Select items → Process Return |
| Record mid-day cash add | Drawer → Cash In → Enter amount & reason |
| Close shift | Close Shift → Count cash → Enter actual amount → Close |

---

## Troubleshooting

| Problem | Solution |
| :--- | :--- |
| Scanner not working | Click inside the product search bar first, then scan |
| Offline banner won't go away | Check your network connection. Do NOT refresh the page |
| Item not found when scanning | Check if the barcode is registered. Use manual search by name |
| Cannot override price | You need `pos:override-price` permission — ask your manager |
| Payment button greyed out | Cart must have at least one item and a positive total |
