# Functional Testing Document (fdoc) — Module 1: Platform Onboarding System

This document is the official functional testing playbook for **Module 1: Platform Administration & Tenant Onboarding**. Follow these step-by-step UI actions, API specifications, and database validation queries to test the onboarding system from A to Z.

---

## 📋 General Prerequisites & Configuration
Before starting, ensure the following local configurations are active:
* **API Server**: Running on `http://localhost:3900`
* **Admin UI Panel**: Running on `http://localhost:3000`
* **Local Subdomain Router**: Ensure you have mapping entries in your `/etc/hosts` file:
  ```hosts
  127.0.0.1  localhost
  127.0.0.1  lazzpharma.localhost
  ```

---

## 🔍 Feature 1.1: System Tenant Onboarding

### 1.1.1 Objective
Verify that a new tenant (business/store) can register on the platform, receive an isolated database sandbox, and have default roles and a standard Chart of Accounts (COA) seeded automatically.

### 1.1.2 Step-by-Step UI Flow
1. Open your browser and navigate to `http://localhost:3000/system` (Super-Admin Panel).
2. Click on the **Onboard Tenant** button.
3. Fill out the form with the following values:
   * **Store Name**: `Lazz Pharma`
   * **Subdomain**: `lazzpharma`
   * **Admin Name**: `Lazz Admin`
   * **Admin Username**: `lazzadmin`
   * **Owner Email**: `owner@lazzpharma.com`
   * **Owner Password**: `SecurePassword123!`
   * **Plan Selection**: Select the premium enterprise plan from the dropdown list.
4. Click **Confirm Onboard**.

### 1.1.3 API Specification
* **Endpoint**: `POST /api/v1/onboard`
* **HTTP Headers**:
  * `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "storeName": "Lazz Pharma",
    "subdomain": "lazzpharma",
    "planId": "3ba7ff70-b1f8-40e5-b96e-cb32f5052248",
    "name": "Lazz Admin",
    "username": "lazzadmin",
    "email": "owner@lazzpharma.com",
    "password": "SecurePassword123!"
  }
  ```
  *(Note: Retrieve a valid `planId` UUID from the database `subscription_plans` table before sending).*
* **Expected Response (`201 Created` / `200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Store created successfully",
    "subdomain": "lazzpharma"
  }
  ```

### 1.1.4 Database Verification
Connect to your database via terminal or GUI and run the following queries to verify database seeding and tenant isolation:

1. **Verify Tenant Record Creation**:
   ```sql
   SELECT id, store_name, subdomain, status, active_subscription_id 
   FROM tenants 
   WHERE subdomain = 'lazzpharma';
   -- Expect 1 row: status = 'ACTIVE'
   ```
2. **Verify Owner User Creation**:
   ```sql
   SELECT id, email, is_staff, tenant_id 
   FROM users 
   WHERE email = 'owner@lazzpharma.com';
   -- Expect 1 row: is_staff = false, tenant_id matches the tenant UUID above.
   ```
3. **Verify Seeded Tenant-Specific Roles**:
   ```sql
   SELECT id, name, is_system_role 
   FROM roles 
   WHERE tenant_id = 'YOUR_TENANT_UUID';
   -- Expect default roles: Owner, Administrator, Cashier, Inventory Supervisor, Accountant, HR Manager.
   ```
4. **Verify Seeded Chart of Accounts (COA)**:
   ```sql
   SELECT code, name, type 
   FROM accounts 
   WHERE tenant_id = 'YOUR_TENANT_UUID'
   ORDER BY code ASC;
   -- Expect default accounting codes: 1000 (Cash), 1100 (Inventory), 1200 (AR), 2100 (AP), 2200 (Tax), 2300 (Wallet), 4000 (Revenue), 5000 (COGS).
   ```

---

## 🔍 Feature 1.2: Custom Domain Setup & DNS Resolution

### 1.2.1 Objective
Verify that a tenant can configure their own custom business domain and successfully verify the CNAME/DNS records to route traffic.

### 1.2.2 Step-by-Step UI Flow
1. Log in to the tenant panel: `http://lazzpharma.localhost:3000/admin`.
2. Go to **Settings -> Domains**.
3. Input custom domain: `lazzpharma.com` in the text field.
4. Click **Request Custom Domain Verification**.

### 1.2.3 API Specification
* **Request Domain Mapping**:
  * **Endpoint**: `POST /api/v1/system/tenants/domain`
  * **Payload**:
    ```json
    {
      "customDomain": "lazzpharma.com"
    }
    ```
* **Trigger DNS Mock Resolution (Local Testing)**:
  * **Endpoint**: `POST /api/v1/system/tenants/domain/verify`
  * **Payload**:
    ```json
    {
      "domain": "lazzpharma.com"
    }
    ```
  * **Expected Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": {
        "customDomainStatus": "VERIFIED",
        "customDomainVerifiedAt": "2026-06-20T22:45:00.000Z"
      }
    }
    ```

### 1.2.4 Database Verification
Run this query to check that the domain configuration status is updated:
```sql
SELECT custom_domain, custom_domain_status, custom_domain_verified_at, ssl_enabled 
FROM tenants 
WHERE subdomain = 'lazzpharma';
-- Expect: custom_domain_status = 'VERIFIED', ssl_enabled = true, and verified timestamp populated.
```

---

## 🔍 Feature 1.3: Subscription Gating & Plan Overrides

### 1.3.1 Objective
Ensure that premium services are gated by active subscription plans and expire when subscription dates have passed.

### 1.3.2 Step-by-Step UI Flow & Simulation
1. Onboard a tenant on a "Basic Tier" plan.
2. Attempt to open **Admin -> AI Settings** page (`/admin/settings/ai`).
3. Verify that the UI displays a restriction modal or locks the page.
4. Now, log in to your database tool and manually expire the subscription:
   ```sql
   UPDATE tenants 
   SET subscription_ends_at = NOW() - INTERVAL '1 day' 
   WHERE subdomain = 'lazzpharma';
   ```
5. Reload the Admin page: `http://lazzpharma.localhost:3000/admin`.

### 1.3.3 Expected Results
* The page displays a full-screen banner: **"Subscription Expired. Access Suspended."**
* Any HTTP calls made to API routes for the tenant return `403 Forbidden` with header message `Subscription Expired`.

---

## 🏁 Verification Status Checklist
* [ ] Tenant creation succeeds on API.
* [ ] Owner user is assigned the default Owner role.
* [ ] Default COA entries are successfully seeded in `accounts` table.
* [ ] Subdomain resolves correctly on local browser.
* [ ] Custom Domain maps and updates state to `PENDING`.
* [ ] DNS verification updates status to `VERIFIED` and flags `ssl_enabled = true`.
* [ ] Feature gate blocks basic accounts from accessing premium features.
* [ ] Expiration date simulation triggers full application locks.
