# 🏁 Store Owner Onboarding Manual

This guide is designed specifically for **Store Owners** (business owners and managers) who are registering their store on the platform for the first time. It walks you through the signup process, details what is auto-initialized for your store behind the scenes, and outlines your Day 1 configuration tasks.

---

## 1. Step-by-Step Registration (The Onboarding Form)

To register your business on the SaaS platform, navigate to the public onboarding page (e.g., `http://localhost:3000/onboard`) and complete the registration form:

1. **Store Name:** Input your formal business name (e.g., `Luxe Cosmetics`).
2. **Subdomain:** Choose a unique subdomain for your store URL (e.g., entering `luxecosmetics` will host your admin panel at `http://luxecosmetics.localhost:3000/admin`).
3. **Select Subscription Plan:** Select your tier based on your business size:
   - **Starter:** Free tier for single-location catalog selling.
   - **Pro Seller:** Paid tier adding POS, expenses, coupon campaigns, and up to 5 branches.
   - **Enterprise:** Full ERP suite adding multi-warehouse inventory, HRM shift payroll, and accounting general ledgers.
4. **Super Owner Account Setup:** Create your primary administrator credentials:
   - **Full Name:** Your name.
   - **Username:** Your admin username.
   - **Email Address:** Your email (used for owner login and billing alerts).
   - **Secure Password:** Create a strong password.
5. **Billing Cycle:** Select Monthly or Annual billing.
6. **Submit:** Click "Launch Store". The system will process your registration and redirect you to your new store dashboard.

---

## 2. Behind the Scenes: What the System Auto-Creates

To save you time, the onboarding engine instantly seeds and configures your business workspace with standard defaults inside a secure database transaction. When your account is ready, the following relations are pre-established:

| Auto-Created Entity | Default Configuration | Relational Purpose |
| :--- | :--- | :--- |
| **Main Branch** | Named `"Main Branch"` | The default physical location for your operations. |
| **Main Warehouse** | Named `"Main Warehouse"` | Linked to your Main Branch to store your catalog inventory. |
| **Main POS Drawer** | Named `"Main Till"` | Linked to your Main Branch to enable immediate register checkout. |
| **Owner Profile** | Assigned as `ADMIN` | Your user account, configured with global owner permissions. |
| **Platform RBAC Roles** | 7 pre-set role templates | Seeded roles (Manager, Accountant, Cashier, etc.) ready to assign to staff. |
| **Chart of Accounts** | 50+ standard accounts | Seeded Cash, Inventory, and Tax ledger accounts to track your financials. |
| **Plan Feature Flags** | Mapped to your chosen plan | Dynamic route permissions enabling/disabling premium ERP modules. |

---

## 3. First-Time Login (Navigating Your Admin Panel)

After onboarding, navigate to your store admin panel:
* **URL:** `http://[your-subdomain].localhost:3000/admin`
* Log in using the email and password you created during step 1.

Upon logging in, you will be greeted by the **Setup Progress Wizard** on the dashboard.

---

## 4. Day 1 Configuration Checklist (Relational Setup)

To transition your business into live operations, complete these four initial setup tasks:

### Task 1: Complete Your Brand Profile
Before selling, configure how your invoice receipts and emails look to customers.
1. Go to **System Settings → General Info** (or `Settings → Organization`).
2. Upload your company **Logo** (PNG or WebP format).
3. Set your primary operational **Currency** (e.g., `BDT ৳` or `USD $`).
4. Input your physical business tax address and customer contact hotline.

### Task 2: Configure Online Payments (For eCommerce Stores)
If you intend to sell products online through your storefront, activate your payment processor:
1. Go to **System Settings → Payment Methods**.
2. Input your merchant credentials (e.g., SSLCommerz Store ID and Store Password).
3. Toggle the gateway status to **Enabled**.

### Task 3: Onboard Your Core Staff
Invite your team members and restrict what they can see based on their role:
1. Go to **Access Control → Staff Accounts → Invite New Member**.
2. Input their email and select their base role (e.g., `Cashier` or `Inventory Manager`).
3. **Set Organizational Boundary Scopes:**
   - **Branch Scope:** Select which branches the user can access.
   - **Warehouse Scope:** Select which warehouses the user can access.
   - *Example:* A cashier assigned to Mirpur Branch will be blocked from accessing Gulshan Branch transactions.

### Task 4: Set Up Suppliers & Products
Set up your catalog relations to begin procurement:
1. Go to **Procurement → Suppliers (SRM)** and input the companies you buy stock from.
2. Go to **Catalog → Categories** to organize your shelves.
3. Go to **Catalog → Products → Add Product** to publish your items.
