# Functional Testing Document (fdoc) — Module 2: Authentication & RBAC System

This document is the official functional testing playbook for **Module 2: Authentication, Security & RBAC**. Follow these step-by-step UI actions, API specifications, and database validation queries to test the authentication and role-based access control systems from A to Z.

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
* **Mail Sandbox**: MailHog running on `http://localhost:8025` to capture verification codes and staff invitation tokens.

---

## 🔍 Feature 2.1: Login, JWT Token Issuance & Sessions

### 2.1.1 Objective
Verify that staff users can log in with their email and password, receive a valid JSON Web Token (JWT) in a secure cookie, and register a session in the database.

### 2.1.2 Step-by-Step UI Flow
1. Navigate to the login page: `http://lazzpharma.localhost:3000/login`.
2. Input the credentials of the store owner:
   * **Email**: `owner@lazzpharma.com`
   * **Password**: `SecurePassword123!`
3. Click **Login**.

### 2.1.3 API Specification
* **Endpoint**: `POST /api/v1/admin/login`
* **Request Payload**:
  ```json
  {
    "email": "owner@lazzpharma.com",
    "password": "SecurePassword123!"
  }
  ```
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Admin Login successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Cookie Handling**: Confirm that a secure, HTTP-only cookie named `token` containing the `accessToken` is set in the browser's cookies.

### 2.1.4 Database Verification
Run the following query in your database:
```sql
SELECT s.id, s.ip, s.expires_at, s.revoked_at, u.email 
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'owner@lazzpharma.com' AND s.revoked_at IS NULL;
-- Expect: 1 active row with a valid expiration date and IP address.
```

---

## 🔍 Feature 2.2: Staff Onboarding & Invitation Flow

### 2.2.1 Objective
Test the end-to-end invitation flow for inviting a new staff member, intercepting the invitation token via MailHog, and registering the account with assigned roles and scope constraints.

### 2.2.2 Step-by-Step UI Flow
1. Log in as the Owner (`owner@lazzpharma.com`). Go to **Settings -> Team Management -> Invite Staff**.
2. Enter the following details:
   * **Email**: `cashier@lazzpharma.com`
   * **Role**: Select `POS Cashier` (Role UUID: `CASHIER_ROLE_UUID`).
   * **Scope**: Scope the cashier strictly to **Dhaka Branch** (Branch UUID: `DHAKA_BRANCH_UUID`).
3. Click **Send Invitation**.
4. Open the MailHog dashboard at `http://localhost:8025`.
5. Find the invitation email for `cashier@lazzpharma.com`, copy the sign-up token from the URL, and navigate to the acceptance page: `http://lazzpharma.localhost:3000/accept-invitation?token=TOKEN_VALUE`.
6. Fill out the registration form with a new password (`CashierPassword123!`) and click **Submit**.

### 2.2.3 API Specification
* **Send Invitation**:
  * **Endpoint**: `POST /api/v1/admin/users/team/invite`
  * **HTTP Headers**: Include Bearer JWT authorization.
  * **Payload**:
    ```json
    {
      "email": "cashier@lazzpharma.com",
      "roleId": "CASHIER_ROLE_UUID",
      "scopeBranchId": "DHAKA_BRANCH_UUID"
    }
    ```
* **Accept Invitation**:
  * **Endpoint**: `POST /api/v1/auth/accept-invitation`
  * **Payload**:
    ```json
    {
      "token": "INVITATION_TOKEN_FROM_MAILHOG",
      "password": "CashierPassword123!",
      "firstName": "Samiul",
      "lastName": "Haque"
    }
    ```

### 2.2.4 Database Verification
Run the following queries to verify the invitation transitions:
```sql
-- 1. Check invitation status
SELECT email, status, role_id, invited_by 
FROM staff_invitations 
WHERE email = 'cashier@lazzpharma.com';
-- Expect: status = 'ACCEPTED'

-- 2. Check user role assignment with branch scope restrictions
SELECT user_id, role_id, scope_branch_id, scope_warehouse_id 
FROM user_role_assignments 
WHERE tenant_id = 'YOUR_TENANT_UUID' 
  AND user_id = (SELECT id FROM users WHERE email = 'cashier@lazzpharma.com' LIMIT 1);
-- Expect: role_id matches Cashier role, scope_branch_id matches Dhaka Branch UUID, and scope_warehouse_id is null.
```

---

## 🔍 Feature 2.3: Branch & Warehouse Scoping (Gating)

### 2.3.1 Objective
Verify that users scoped to a specific branch or warehouse are blocked when trying to retrieve, create, or update resources in another branch or warehouse.

### 2.3.2 Step-by-Step UI Flow
1. Log in as the Cashier (`cashier@lazzpharma.com`) scoped strictly to **Dhaka Branch**.
2. Navigate to **Orders** or **Inventory** dashboard.
3. Try to view orders for **Sylhet Branch** or try to fetch data from Sylhet Branch using a custom filter.
4. Verify that the UI displays a **"403 - Access Denied"** warning.

### 2.3.3 API Specification
* **Endpoint**: `GET /api/v1/admin/orders?branchId=SYLHET_BRANCH_UUID`
* **Expected Response (`403 Forbidden`)**:
  ```json
  {
    "success": false,
    "statusCode": 403,
    "message": "Access Denied: You do not have permissions to access resources in this branch."
  }
  ```
  *(Note: Enforced by the `BranchScopeGuard` in the server request pipeline).*

---

## 🔍 Feature 2.4: Direct Permission Overrides

### 2.4.1 Objective
Ensure that direct user overrides (granting/revoking a specific permission code) bypass role-level configurations.

### 2.4.2 Step-by-Step UI Flow
1. Log in as the Cashier (`cashier@lazzpharma.com`). The cashier role does *not* possess the price override permission `pos:override-price`. Go to the POS page, add an item to the cart, and confirm the price field is locked.
2. Log in in a separate browser window as the Owner (`owner@lazzpharma.com`). Go to **Team Management -> Cashier Settings -> Permission Overrides**.
3. Add a direct override:
   * **Permission**: `pos:override-price`
   * **Mode**: `GRANT` (Set `isGranted = true`)
4. Click **Apply Override**.
5. Back in the Cashier browser window, refresh the POS page.

### 2.4.3 Expected Results
* The Cashier can now modify the unit price of items in the POS cart.
* In database table `user_permission_overrides`, verify a row exists for the cashier's user ID with `permission_code = 'pos:override-price'` and `is_granted = true`.
* **Revoke Check**: Change the override mode to `REVOKE` (`isGranted = false`). Confirm the price field is instantly locked again for the cashier, regardless of role defaults.

---

## 🏁 Verification Status Checklist
* [ ] Login returns access & refresh tokens.
* [ ] IP address and user-agent are logged in the active session.
* [ ] Team invitation record is created and sent via email.
* [ ] Intercepted token registration works.
* [ ] Newly logged-in cashier user is constrained to their scoped branch.
* [ ] Scope gating restricts cashiers from viewing Sylhet Branch data.
* [ ] Cashier override functions correctly.
* [ ] Override revoke blocks action instantly.
