# CRM & Loyalty Module — Requirements & Implementation Plan

> Status in current project: **Mostly missing**
> Source repo: `eCommerce-multi-store-saas`
> Author note: this document defines what must be added to bring the project from a basic "customer list + subscribers + leads" surface to a real ERP-grade CRM, customer loyalty, wallet/credit, segmentation, and AR system.
> Date: 2026-05-20

---

## 1. Why This Module Is Needed

The project already has:

- `UserEntity` storing customers with `role = USER` (`server/src/modules/admin/core/user/entities/user.entity.ts`)
- Customer admin list (`server/src/modules/admin/customer/customer.controller.ts`, `client/features/admin/customer/components/CustomerList.tsx`)
- Leads (`server/src/modules/admin/customer/lead/*`)
- Email subscribers (`server/src/modules/admin/customer/subscriber/*`)
- Campaign audience service (`server/src/modules/admin/marketing/campaign/services/audience.service.ts`)
- Coupons and promotions (`server/src/modules/admin/sales/coupon`, `server/src/modules/admin/sales/promotion`)

But there is **no**:

- Customer segmentation engine
- Loyalty points / rewards / tiers
- Store credit / wallet
- B2B credit limits or payment terms enforcement
- AR (Accounts Receivable) ledger and aging
- Referral program
- Customer lifecycle/communication preferences
- Birthday / anniversary / win-back automation
- Customer 360 view (lifetime spend, orders, returns, RFM)

This document defines what must be built.

---

## 2. Module Scope

The CRM/Loyalty module is the **customer relationship and monetization layer** of the ERP. It must answer:

1. Who is each customer? (profile, type, branch, contact preferences)
2. How valuable is each customer? (RFM, lifetime value, segment)
3. How do we reward them? (points, tiers, perks, referrals)
4. How do they pay? (cash, card, wallet, store credit, credit limit, AR terms)
5. How much do they owe us? (AR ledger, aging, dunning)
6. How do we communicate with them? (email, SMS, push, opt-in/out)
7. How do we measure CRM health? (acquisition, retention, churn, NPS)

---

## 3. Functional Requirements

### 3.1 Customer Profile Extensions

Extend `UserEntity` (for `role = USER`) with ERP-grade customer fields:

| Field | Type | Purpose |
| :--- | :--- | :--- |
| `customerCode` | varchar, unique per store | Human-friendly ID (e.g. `CUST-000123`) |
| `customerType` | enum | `RETAIL`, `WHOLESALE`, `VIP`, `B2B`, `GOVERNMENT` |
| `preferredBranchId` | uuid | Home branch for branch managers |
| `priceBookId` | uuid | Custom pricing tier |
| `taxId` | varchar | VAT/GST registration number |
| `companyName` | varchar | For B2B accounts |
| `birthday` | date | Birthday campaigns |
| `anniversary` | date | Anniversary campaigns |
| `acquisitionSource` | enum | `ONLINE`, `POS`, `LEAD`, `REFERRAL`, `IMPORT` |
| `referredByUserId` | uuid | Referral attribution |
| `defaultCurrency` | varchar(3) | For multi-currency stores |
| `language` | varchar(5) | Notification locale |
| `notes` | text | Internal admin notes |
| `tags` | jsonb | Free-form labels (`vip`, `bad-debtor`, etc.) |
| `consent` | jsonb | `{email, sms, push, whatsapp}` flags + timestamp |
| `lifetimeValue` | decimal | Cached LTV (recomputed by job) |
| `lastOrderAt` | timestamp | For churn analysis |

**Backward compatibility:** all fields nullable; existing customer rows must continue to work.

### 3.2 Customer Segmentation

A segment is a saved query over customers/orders/loyalty.

Must support:

- **Static segments** — admin manually picks members.
- **Dynamic segments** — rule-based, recomputed on schedule or event.
- **RFM segments** — auto-classify by Recency, Frequency, Monetary score (1–5 each).
- **Lifecycle segments** — `NEW`, `ACTIVE`, `AT_RISK`, `CHURNED`, `WIN_BACK`.

Rule examples:

- `totalSpend > 5000 AND lastOrderAt < 30d`
- `customerType = WHOLESALE`
- `tags contains 'vip'`
- `loyaltyTier = GOLD`
- `branchId = X AND orders.count >= 3`

Segments must be reusable by:

- Coupons (restrict coupon to segment)
- Promotions (segment-targeted)
- Campaigns (audience source)
- Loyalty rules (e.g. 2x points for GOLD)
- Price books (segment-based pricing)

### 3.3 Loyalty Points Engine

Two ledger model: **points ledger** and **redemption rules**.

#### 3.3.1 Earning rules

- Per spend (e.g. 1 point per $1, configurable per store/currency)
- Per product/category multiplier (2x on electronics)
- Per segment multiplier (3x for VIP)
- Bonus events: sign-up, birthday, first order, referral success, review submitted
- Per channel: POS vs online vs B2B

#### 3.3.2 Redemption rules

- Cash equivalent (e.g. 100 points = $1)
- Min/max redemption per order
- Exclusion list (cannot redeem on sale items, gift cards)
- Combined with coupons: allow/deny
- Expiry: configurable (e.g. points expire 12 months after earning)

#### 3.3.3 Loyalty tiers

- Tiers: `BRONZE`, `SILVER`, `GOLD`, `PLATINUM` (configurable count + names)
- Qualification: by 12-month spend OR points OR order count
- Tier benefits: multiplier, free shipping threshold, early access, dedicated support
- Tier downgrade: yearly review or rolling window

#### 3.3.4 Points ledger

Immutable ledger with running balance per customer:

```
loyalty_ledger (
  id, storeId, customerId,
  type ENUM('EARN','REDEEM','EXPIRE','ADJUST','REVERSE'),
  points INT,         -- signed
  balanceAfter INT,
  referenceType,      -- 'ORDER','RETURN','MANUAL','REFERRAL','BIRTHDAY'
  referenceId,
  expiresAt,
  createdAt, createdBy
)
```

Rules:

- Earning is committed when order reaches a configurable status (default `DELIVERED`).
- Returns reverse the earned points pro-rata.
- Expired points generate an `EXPIRE` entry, never delete history.

### 3.4 Store Credit & Wallet

A customer can hold **store credit** (refundable balance) and a **gift wallet** (gifted/promo balance) — both as ledgers, never as a mutable counter.

```
wallet_ledger (
  id, storeId, customerId,
  walletType ENUM('STORE_CREDIT','GIFT','REFUND'),
  amount DECIMAL,     -- signed
  balanceAfter DECIMAL,
  currency,
  referenceType,      -- 'RETURN','MANUAL_TOPUP','ORDER_PAYMENT','EXPIRY'
  referenceId,
  expiresAt,
  createdAt, createdBy
)
```

Operations:

- **Top up** (manual or from promo)
- **Refund to wallet** (faster than card refund; configurable per store)
- **Pay with wallet at checkout** (full or partial)
- **Expire** (configurable)
- **Transfer between wallet types** (admin only, with audit)

Wallet operations **must** post matching accounting journals (see §3.7).

### 3.5 B2B Credit & Payment Terms

For `customerType IN (WHOLESALE, B2B, GOVERNMENT)`:

| Field | Description |
| :--- | :--- |
| `creditLimit` | Max outstanding balance allowed |
| `creditTermsDays` | Net-7, Net-15, Net-30, Net-60, Net-90 |
| `creditHold` | Boolean flag set when limit breached or overdue |
| `creditApprovedBy` | User id who approved limit |
| `creditApprovedAt` | Timestamp |
| `creditNotes` | Reason/comments |

Checkout rules:

1. When customer selects "Pay on Account" or "Net Terms":
   - Compute current AR balance.
   - Reject if `currentAR + orderTotal > creditLimit`.
   - Reject if `creditHold = true`.
   - Reject if any invoice is overdue beyond `creditTermsDays + graceDays`.
2. On success, order is created with `paymentStatus = ON_CREDIT` and an AR invoice is generated.
3. Admin can manually override but must record reason → audit log.

### 3.6 Accounts Receivable (AR)

Every credit sale creates an AR record. Every customer payment reduces it.

```
ar_ledger (
  id, storeId, customerId,
  type ENUM('INVOICE','PAYMENT','CREDIT_NOTE','WRITE_OFF','ADJUSTMENT','REFUND'),
  amount DECIMAL,       -- signed (debit positive for invoice, credit negative for payment)
  balanceAfter DECIMAL,
  currency,
  referenceType,
  referenceId,
  dueDate,
  createdAt, createdBy
)
```

**AR Aging Report** buckets:

- Current (not yet due)
- 1–30 days overdue
- 31–60 days
- 61–90 days
- 90+ days

Aging must:

- Be generated per customer and per store.
- Be exportable (CSV/PDF).
- Trigger automatic notifications at configurable intervals (dunning).
- Auto-set `creditHold = true` when threshold crossed.

### 3.7 Accounting Integration

CRM/Loyalty events that **must** post journals:

| Event | Dr | Cr |
| :--- | :--- | :--- |
| Credit sale | AR (asset) | Sales Revenue / Tax Payable |
| Customer payment | Cash/Bank | AR |
| Refund to wallet | Refund Expense / Sales Returns | Wallet Liability |
| Wallet top-up (paid) | Cash | Wallet Liability |
| Wallet used on order | Wallet Liability | Sales Revenue |
| Loyalty points earned | Loyalty Cost (expense) | Loyalty Liability |
| Loyalty points redeemed | Loyalty Liability | Sales Revenue / Discount Given |
| Loyalty points expired | Loyalty Liability | Other Income |
| AR write-off | Bad Debt Expense | AR |

All journal postings must go through the existing `AccountingService.createJournalEntry()` flow with idempotency keys.

### 3.8 Referral Program

```
referrals (
  id, storeId, referrerUserId, refereeUserId,
  status ENUM('PENDING','QUALIFIED','REWARDED','EXPIRED','CANCELLED'),
  referralCode,
  qualifyingOrderId,
  rewardType ENUM('POINTS','WALLET','COUPON'),
  rewardAmount,
  createdAt, qualifiedAt, rewardedAt
)
```

Rules:

- Each customer gets a unique `referralCode` on signup.
- Referee gets a sign-up bonus / coupon.
- Referrer gets a reward only when referee completes a qualifying order (configurable threshold).
- Anti-fraud: same IP/device flags, max referrals per period, self-referral block.

### 3.9 Communication Preferences & Consent

Single source of truth on `users.consent`:

```json
{
  "email": { "marketing": true, "transactional": true, "updatedAt": "..." },
  "sms":   { "marketing": false, "transactional": true, "updatedAt": "..." },
  "push":  { "marketing": true, "transactional": true, "updatedAt": "..." },
  "whatsapp": { "marketing": false, "transactional": false, "updatedAt": "..." }
}
```

Rules:

- Campaign audience query **must** filter by channel consent.
- Transactional messages (order confirmation, payment receipts) override marketing opt-out.
- Unsubscribe links update consent and audit log.
- GDPR/PDPA right-to-delete: soft-delete with anonymization (`name → 'Deleted User'`, email hash retained for audit).

### 3.10 Customer 360 View

A single admin page showing for one customer:

- Profile + tags + segments + tier
- Lifetime value, total orders, avg order value, last order date
- RFM score
- Loyalty balance + recent points ledger
- Wallet balance + recent wallet ledger
- AR balance + open invoices + aging
- Order history (incl. POS + online)
- Returns history
- Reviews submitted
- Support tickets / chat history
- Communication timeline (campaigns sent, opens, clicks)
- Audit trail of admin actions

### 3.11 Customer Lifecycle Automation

Triggers:

- `signup` → welcome email + sign-up bonus points
- `first_order` → thank-you email + bonus
- `birthday` → coupon or bonus points
- `anniversary` → loyalty multiplier
- `cart_abandoned` (24h) → reminder
- `inactive` (30/60/90d) → win-back campaign
- `tier_upgrade` → congratulations + perks email
- `at_risk` segment entry → discount offer
- `refund_completed` → satisfaction survey

Implementation: use existing campaign engine + BullMQ scheduled jobs.

---

## 4. Non-Functional Requirements

- **Multi-store safe** — every CRM read/write must scope by `storeId`.
- **Branch-aware** — segment / report endpoints respect branch-scoped staff.
- **Auditable** — points, wallet, AR, and credit limit changes always emit `AuditLog`.
- **Idempotent** — wallet/AR/points postings must accept an idempotency key.
- **Concurrency-safe** — wallet/AR balance updates must use row locks or optimistic versioning.
- **Performant** — segment evaluation runs as async job for large stores; cache RFM scores.
- **GDPR compliant** — export, delete, anonymize, consent versioning.
- **Currency-aware** — wallet, AR, loyalty value must store currency; multi-currency stores need FX snapshots.

---

## 5. Data Model Additions

### New tables

| Table | Purpose |
| :--- | :--- |
| `customer_segments` | Segment definition (static/dynamic). |
| `customer_segment_rules` | JSON DSL or per-rule rows. |
| `customer_segment_members` | Materialized membership (refreshed by job). |
| `loyalty_programs` | Per-store loyalty config. |
| `loyalty_tiers` | Tier definitions and benefits. |
| `loyalty_rules` | Earning/redeeming rules. |
| `loyalty_ledger` | Immutable points ledger. |
| `wallet_ledger` | Store credit / gift wallet ledger. |
| `ar_ledger` | Customer AR ledger. |
| `customer_invoices` | Optional, if not unified with order invoices. |
| `referrals` | Referral tracking. |
| `customer_tags` | Tag dictionary (optional). |
| `customer_communication_log` | Outbound message history per customer. |
| `customer_notes` | Internal admin notes with timestamps + author. |

### Modified tables

- `users` — add fields listed in §3.1.
- `orders` — add `loyaltyPointsEarned`, `loyaltyPointsRedeemed`, `walletAmountUsed`, `arInvoiceId`, `customerSegmentSnapshot`.
- `order_returns` — add `loyaltyPointsReversed`, `walletAmountRefunded`.

---

## 6. API Surface (Backend)

All under `/api/admin/...` and guarded by `JwtAuthGuard`, `SubscriptionGuard`, `PermissionsGuard`.

### Customer
- `GET    /customers` (existing — extend with segment/tier filters)
- `GET    /customers/:id` (new — full 360 view)
- `PATCH  /customers/:id` (new — update CRM fields, credit limit, tags)
- `POST   /customers/:id/credit-hold` (new — toggle)
- `POST   /customers/:id/notes` (new)
- `GET    /customers/:id/timeline` (new — events feed)

### Segments
- `GET    /segments`
- `POST   /segments`
- `PATCH  /segments/:id`
- `DELETE /segments/:id`
- `POST   /segments/:id/refresh`
- `GET    /segments/:id/members`

### Loyalty
- `GET    /loyalty/program` / `PATCH /loyalty/program`
- `GET    /loyalty/tiers` / `POST` / `PATCH` / `DELETE`
- `GET    /loyalty/rules` / `POST` / `PATCH` / `DELETE`
- `GET    /loyalty/ledger?customerId=`
- `POST   /loyalty/adjust` (manual earn/deduct with reason)
- `POST   /loyalty/expire-run` (admin trigger, normally cron)

### Wallet
- `GET    /wallet/:customerId/balance`
- `GET    /wallet/:customerId/ledger`
- `POST   /wallet/:customerId/topup`
- `POST   /wallet/:customerId/refund-to-wallet`
- `POST   /wallet/:customerId/adjust`

### AR
- `GET    /ar/aging`
- `GET    /ar/customer/:customerId`
- `POST   /ar/payment`
- `POST   /ar/write-off`
- `POST   /ar/credit-note`

### Referrals
- `GET    /referrals`
- `POST   /referrals/code` (regenerate)
- `POST   /referrals/:id/approve`
- `POST   /referrals/:id/cancel`

### Storefront (customer-facing)
- `GET    /me/loyalty`
- `GET    /me/wallet`
- `GET    /me/referrals`
- `POST   /checkout/apply-wallet`
- `POST   /checkout/apply-points`

---

## 7. Frontend (Admin) Requirements

### Pages

| Route | Purpose |
| :--- | :--- |
| `/admin/customers` (extend) | List with segment, tier, AR balance, credit status columns. |
| `/admin/customers/[id]` (new) | Customer 360 view. |
| `/admin/segments` (new) | Segment list + builder. |
| `/admin/loyalty` (new) | Program config + tiers + rules. |
| `/admin/loyalty/ledger` (new) | Global points ledger view. |
| `/admin/wallet` (new) | Wallet operations + ledger. |
| `/admin/ar` (new) | AR aging dashboard. |
| `/admin/ar/[customerId]` (new) | Customer AR detail + payment recording. |
| `/admin/referrals` (new) | Referral program dashboard. |
| `/admin/crm/automation` (new) | Lifecycle automation rules. |

### Components

- **Segment Builder** — rule chips with logical groups.
- **Customer Timeline** — order, return, points, wallet, AR, communication events.
- **AR Aging Table** — sortable buckets, drill-down to invoice.
- **Loyalty Tier Editor** — drag-rank tiers, set benefits.
- **Credit Limit Dialog** — show current AR, requested limit, approver, reason.
- **Wallet Top-Up Dialog** — amount, type, reason, audit confirmation.

### Storefront (customer)

- "My Rewards" page (points, tier, perks, history).
- "My Wallet" page (balance, ledger, top-up if allowed).
- "Refer a Friend" page (referral code, share buttons, status).
- Checkout: wallet apply, points redeem slider, "Pay on Account" option for B2B.

---

## 8. Permissions

Add to the existing RBAC system:

| Permission | Description |
| :--- | :--- |
| `CRM_READ` (exists) | View customer list/details |
| `CRM_WRITE` | Edit customer profile + tags |
| `CRM_NOTES_WRITE` | Add internal notes |
| `CRM_SEGMENT_MANAGE` | Create/edit segments |
| `LOYALTY_CONFIG` | Edit program/tiers/rules |
| `LOYALTY_ADJUST` | Manual points earn/deduct |
| `WALLET_TOPUP` | Add wallet credit |
| `WALLET_ADJUST` | Manual adjustments |
| `AR_VIEW` | View AR data |
| `AR_RECORD_PAYMENT` | Record customer payments |
| `AR_WRITE_OFF` | Approve bad-debt write-off |
| `CREDIT_LIMIT_APPROVE` | Approve/change credit limit |
| `CREDIT_HOLD_TOGGLE` | Place/release credit hold |
| `REFERRAL_MANAGE` | Approve/cancel referrals |

All "approve/adjust" permissions must require audit log entry with reason.

---

## 9. Reports & Dashboards

- **Customer KPIs**: new customers, active, churn rate, average LTV, top customers.
- **RFM Heatmap**: 5×5 grid with customer counts.
- **Loyalty KPIs**: outstanding liability, points earned/redeemed/expired, redemption rate.
- **Wallet KPIs**: outstanding liability, top-up volume, refund-to-wallet rate.
- **AR Dashboard**: total AR, aging buckets, overdue customers, expected collections.
- **Referral KPIs**: referrals sent, qualified, conversion rate.
- **Campaign attribution**: revenue per campaign / segment.

---

## 10. Integration Points With Existing Modules

| Existing module | Integration |
| :--- | :--- |
| `OrderService` | On `ORDER_DELIVERED` → trigger loyalty earn, wallet refund if applicable. |
| `ReturnService` | On `RETURN_APPROVED` → reverse loyalty points + post wallet refund + AR credit note. |
| `PosService` | POS sale must support: point redemption, wallet payment, customer link, credit sale. |
| `PaymentService` | Add `WALLET` and `ON_CREDIT` payment methods. |
| `AccountingService` | Post journals listed in §3.7. |
| `AuditLogService` | Log every wallet/AR/loyalty/credit-limit mutation. |
| `CampaignModule` / `AudienceService` | Replace ad-hoc audience filters with segment IDs. |
| `CouponService` | Allow coupon eligibility by segment / tier. |
| `NotificationService` | Power lifecycle and dunning automation. |

---

## 11. Risks & Pitfalls

| Risk | Mitigation |
| :--- | :--- |
| Mutating wallet/points counters directly | Always use immutable ledgers. |
| Double-earning on retried order events | Idempotency keys + unique constraint on `(referenceType, referenceId, type)`. |
| Credit limit race on parallel orders | Pessimistic row lock or AR balance check inside DB transaction. |
| Refund-to-wallet without journal | Always pair with accounting posting; reject if accounting fails. |
| Stale segment membership | Schedule incremental refresh + on-event invalidation. |
| Marketing to opted-out users | Centralized consent filter in `AudienceService`. |
| GDPR delete loses audit trail | Anonymize fields but keep ledger entries with hashed reference. |
| Massive segment evaluation on big stores | Run as queue job with progress; cache results. |

---

## 12. Phased Implementation Plan

### Phase 1 — Foundation (must-have before any loyalty)

1. Extend `UserEntity` with CRM fields (§3.1).
2. Build Customer 360 page (read-only).
3. Implement `customer_notes`, tags, consent management.
4. Add segment engine (static + dynamic) and integrate with campaigns.

### Phase 2 — Money & Credit

1. AR ledger + aging report.
2. Credit limit + payment terms + credit hold.
3. Storefront/POS "Pay on Account" support.
4. Accounting journals for credit sale and customer payment.

### Phase 3 — Wallet & Refund Experience

1. Wallet ledger + balance API.
2. Refund-to-wallet flow from returns.
3. Wallet apply at checkout (storefront + POS).
4. Wallet accounting journals.

### Phase 4 — Loyalty Program

1. Program + tiers + earning/redemption rules.
2. Points ledger + ledger UI.
3. Order events → points (earn/redeem/reverse).
4. Loyalty accounting (liability + redemption).
5. Tier evaluation job + tier-upgrade automation.

### Phase 5 — Growth Loops

1. Referral program.
2. Lifecycle automation (welcome, birthday, win-back, abandoned cart).
3. RFM scoring + win-back segments.
4. Reporting dashboards + campaign attribution.

---

## 13. Acceptance Criteria (Definition of Done)

The module is "ERP-ready" when:

- A customer can be classified, tagged, and assigned a price book + credit limit.
- A credit sale blocks if limit/overdue/hold conditions are met, and creates AR + journal.
- A return refunds to wallet (or original method), reverses points, and posts journals.
- A POS or online order can use wallet + points + coupon together without double counting.
- An admin can create a dynamic segment ("Spent > $X in 30 days, opted-in to email") and send a campaign to it.
- AR aging report matches sum of `ar_ledger` per customer.
- Loyalty outstanding liability matches sum of unredeemed/unexpired points × point value.
- Every wallet, points, AR, and credit-limit mutation is visible in the audit log with actor, reason, and timestamps.
- Every endpoint enforces store scope and feature gating.
- All cross-module events are idempotent.

---

## 14. Quick "What To Build First" List

If only one sprint is available, deliver in this order — each item is independently shippable:

1. Extend `users` with CRM fields + migration.
2. Customer detail page (360 read-only).
3. Customer notes + tags + consent.
4. AR ledger + aging report (no UI builder yet).
5. Credit limit field + checkout enforcement.
6. Wallet ledger + refund-to-wallet on return.
7. Loyalty MVP: 1 point / $1, single tier, earn on `DELIVERED`, redeem at checkout.
8. Segment engine + integration with campaigns and coupons.
9. Referral codes + qualifying-order reward.
10. Lifecycle automations (welcome, birthday, win-back).

Each item above adds real ERP value even if later items slip.
