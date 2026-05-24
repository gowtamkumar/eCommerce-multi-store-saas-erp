# ERP User Manual — Super-Admin (Platform Operations)

**Document Version:** 1.0.0  
**Audience:** Platform Owner, DevOps, SaaS Operations Team  
**Last Updated:** May 24, 2026  

---

## Overview
The Super-Admin is the highest privilege user in the system. This role belongs to the **SaaS platform owner** — not to any individual tenant. The Super-Admin has unrestricted access to every tenant's configuration, subscription plan, billing status, and system health metrics.

> **Critical Security Rule:** Super-Admin credentials must never be shared with tenant owners. Access must be protected via 2FA and IP-allowlisting.

---

## Module 1: Platform Dashboard & System Metrics

### 1.1 Accessing the Platform Dashboard
1.  Navigate to `https://platform.yourdomain.com/super-admin`
2.  Log in with your platform owner credentials (email + password + 2FA code)
3.  You land on the **Platform Overview Dashboard**, which displays:

| Metric Card | What it Shows |
| :--- | :--- |
| **Active Tenants** | Count of tenants with `status = ACTIVE` |
| **Trialing Tenants** | Tenants in the `TRIAL` period |
| **Suspended Tenants** | Tenants blocked due to expired billing |
| **Monthly Recurring Revenue (MRR)** | Sum of all active subscription amounts |
| **Total API Requests (Today)** | Aggregated request count from `tenant_traffic` table |
| **System Health** | Redis memory usage, DB connection pool, BullMQ queue depth |

### 1.2 Reading the Request Throttle Graphs
*   The `tenant_traffic` table logs per-tenant hourly API usage volumes.
*   A tenant exceeding their plan's monthly request quota triggers a `429 Too Many Requests` response.
*   To view a specific tenant's usage: **Tenants → Click Tenant → Usage Tab**

---

## Module 2: Subscription Plan Management

### 2.1 Creating a New Subscription Plan
1.  Go to **Plans → Create New Plan**
2.  Fill in the Plan Name (e.g., `Enterprise Annual 2026`), billing interval, and amount.
3.  Under **Feature Keys**, add JSON feature array:
    ```json
    ["custom_domain", "advanced_analytics", "remove_branding", "unlimited_products", "staff_accounts", "multi_currency"]
    ```
4.  Set limits:
    - `max_products`: integer (e.g., `99999` for unlimited)
    - `max_staff_accounts`: integer
    - `max_api_requests_monthly`: integer
5.  Click **Save Plan**. The plan is immediately available for tenant assignment.

### 2.2 Upgrading or Downgrading a Tenant's Plan
1.  Navigate to **Tenants → Search Tenant → Subscription Tab**
2.  Select the new plan from the dropdown
3.  Choose **Effective Date**: `Immediately` or `Next Billing Cycle`
4.  Click **Update Subscription**
5.  The system auto-seeds the `tenant_features` table with the new plan's feature keys.

### 2.3 Suspending a Tenant (Non-Payment)
1.  Go to **Tenants → Search Tenant → Actions → Suspend**
2.  Enter a reason for audit logging
3.  Click **Confirm Suspension**
4.  System sets `tenant.status = SUSPENDED`, which immediately blocks all API calls for that tenant except the `/billing/reactivate` endpoint.

---

## Module 3: Custom Domain Approval Workflow

### 3.1 How Custom Domains Work
*   Tenants register custom domains (e.g., `shop.mybusiness.com`) from their admin settings panel.
*   After submission, `tenant.custom_domain_status = 'PENDING'`.
*   The Super-Admin validates that the tenant has correctly set up their DNS CNAME record pointing to your platform's IP.

### 3.2 Steps to Approve a Custom Domain
1.  Go to **Domains → Pending Requests**
2.  Click the domain entry (e.g., `shop.mybusiness.com`)
3.  Click **Verify DNS** — the system executes a DNS lookup to confirm the CNAME record is pointing to the correct IP.
4.  If the DNS check passes, click **Approve**. Status changes to `VERIFIED`.
5.  If the DNS check fails, click **Send Retry Instructions** to email the tenant the correct DNS setup guide.

---

## Module 4: Tenant Data Management

### 4.1 Searching & Inspecting a Tenant
1.  **Tenants → Search by Name, Email, or Subdomain**
2.  The Tenant Detail view shows:
    - Active plan and expiry date
    - Module feature flags enabled
    - User count, product count, order count
    - Last login timestamp and IP address

### 4.2 Triggering a Tenant Data Export (GDPR)
1.  Go to **Tenants → [Tenant Name] → Actions → Export Data**
2.  The system queues a BullMQ job to compile all tenant data into a GDPR-compliant ZIP archive
3.  Download link is emailed to the tenant's registered email address within 24 hours

### 4.3 Deleting / Anonymizing a Tenant (Account Closure)
1.  Go to **Tenants → [Tenant Name] → Actions → Initiate Deletion**
2.  The system sets `tenant.deleted_at = NOW()` (soft delete)
3.  A background cron job runs at 23:59 UTC daily to permanently anonymize soft-deleted tenants older than 30 days:
    - Replaces PII fields (name, email, phone) with `[DELETED]`
    - Removes file uploads from S3 bucket
    - Retains financial records in anonymized form for 7-year GAAP compliance

---

## Module 5: System Operations

### 5.1 Seeding Default Tax Templates
Some countries/regions require pre-configured tax structures. To seed a regional tax template for new tenants:
1.  Go to **System → Tax Templates → New Template**
2.  Define the region code (e.g., `BD` for Bangladesh), tax name (`VAT 15%`), and applicable categories.
3.  Enable **Auto-assign to new tenants in this region** toggle.

### 5.2 Running a Payroll Audit Across All Tenants
> Reserved for compliance audits. Requires dual-admin approval (Super-Admin + Compliance Officer).

1.  **System → Audit Reports → Payroll Cross-Tenant Audit**
2.  Select the fiscal month range
3.  Export generates an anonymized summary (no individual salary data is exposed)

### 5.3 Queue Health Monitoring
1.  Go to **System → Queue Dashboard** (powered by BullMQ Board UI)
2.  Key queues to monitor:
    - `product-queue`: Stock update jobs
    - `email-queue`: Notification dispatch
    - `reports-queue`: Scheduled PDF generation
    - `sync-queue`: POS offline data synchronization
3.  **Failed Jobs:** Investigate failed jobs by clicking the job entry. Retry manually or fix the payload.

---

## Quick Reference Cheatsheet

| Task | Navigation Path |
| :--- | :--- |
| Create new subscription plan | Plans → Create New Plan |
| Suspend tenant for non-payment | Tenants → [Tenant] → Actions → Suspend |
| Approve custom domain | Domains → Pending Requests → Verify DNS → Approve |
| Export tenant GDPR data | Tenants → [Tenant] → Actions → Export Data |
| View queue depth | System → Queue Dashboard |
| Seed tax template | System → Tax Templates → New Template |
