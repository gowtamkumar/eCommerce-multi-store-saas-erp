# ERP Project Assessment — Update

> Senior engineering review of the `eCommerce-multi-tenant-saas` repository.
> Source of evidence: live code inspection, `tsc --noEmit` on both apps, `eslint` on both apps, and direct file reads across `server/src/modules` and `client/`.
> Date: 2026-05-21
> Previous assessment: [`ERP-PROJECT-ASSESSMENT.md`](./ERP-PROJECT-ASSESSMENT.md) (2026-05-20)
> Status: This is a **delta update** on top of the 2026-05-20 assessment. Several items the older doc marked as "missing" are now implemented; new concrete defects are also called out.

---

## 1. Executive Summary

This is a serious ERP-oriented multi-tenant commerce platform — not a typical eCommerce admin. The codebase has matured noticeably since 2026-05-20.

But it is still **not production-grade ERP**. The blockers are not screens — they are a small set of cross-module invariants (idempotency, true stock reservation, complete accounting coverage, journal immutability/reversal, offline-first POS) plus a handful of real code defects identified in §4.

| Metric | Value |
| :--- | :--- |
| Server modules (`.module.ts`) | 64 |
| Server entities (`.entity.ts`) | 91 |
| Server controllers | 63 |
| Server services | 66 |
| TypeORM migrations | 14 |
| Next.js pages (`page.tsx`) | 144 |
| Admin nav feature routes | 64 unique |
| ERP areas reviewed | 11 |
| Significantly more complete than 2026-05-20 | 8 |
| Real code defects still open | 7 |

---

## 2. Build, Type-check, and Lint Status

Ran today (2026-05-21).

| Check | Result | Notes |
| :--- | :--- | :--- |
| `server` — `tsc --noEmit` | **0 errors** | Clean compile. |
| `client` — `tsc --noEmit` | **0 errors** | Clean compile. |
| `server` — `eslint` | 587 errors + 86 warnings | 587 = `prettier/prettier` (auto-fixable). 86 = `@typescript-eslint/no-unused-vars`. No logic-level rule errors. |
| `client` — `eslint` | 1086 errors + 411 warnings | See §2.1. Mostly typing/style; small but real correctness bucket. |
| `server` — `nest build` | Could not run | `server/dist/` is owned by `nobody:nogroup` on disk. Host filesystem issue, not a code issue. |

**Bottom line on builds:** both apps compile. There is no TypeScript error to fix.

### 2.1 Client lint breakdown

| Count | Rule | Category | Severity |
| ---: | :--- | :--- | :--- |
| 919 | `@typescript-eslint/no-explicit-any` | Type weakness | Low (not runtime) |
| 293 | `@typescript-eslint/no-unused-vars` | Dead code | Low |
| 70 | `react/no-unescaped-entities` | Cosmetic | Low |
| 64 | `@next/next/no-img-element` | Perf (use `next/image`) | Low |
| 47 | `react-hooks/exhaustive-deps` | Stale closure | **Medium** |
| 42 | `react/display-name` | DevX | Low |
| 21 | `react-hooks/set-state-in-effect` | Re-render loops | **Medium** |
| 19 | `react-hooks/static-components` | React Compiler | Medium |
| 6 | `jsx-a11y/alt-text` | Accessibility | Low |
| 3 | `react-hooks/immutability` | State mutation | **High** |
| 3 | `@next/next/no-html-link-for-pages` | Routing | Low |
| **2** | **`react-hooks/rules-of-hooks`** | Hook order | **Critical** (see §4.3) |
| 2 | `react-hooks/purity` | Effects in render | High |
| 2 | `@typescript-eslint/prefer-as-const` | Style | Low |
| 2 | `react-hooks/rules-of-hooks` | (same) | (same) |
| 1 | `@typescript-eslint/no-unused-expressions` | Style | Low |
| 1 | `@typescript-eslint/no-require-imports` | Style | Low |

---

## 3. What changed since 2026-05-20

These items the older assessment listed as *missing*, *prototype*, or *UI-only* are now actually implemented in code. Confirmed by direct file reads.

| Area | Old status | Current status (verified file) |
| :--- | :--- | :--- |
| Purchase Requisitions | "UI-local React state only" | Fully persisted with DRAFT → APPROVED/REJECTED → PO_CREATED workflow. `server/src/modules/admin/operations/finance/purchase/services/purchase-requisition.service.ts` |
| RFQ / Quotation | "entity-only" | Controller + service exist. `purchase/controllers/rfq.controller.ts`, `purchase/services/rfq.service.ts` |
| Supplier Invoice | "missing" | Implemented. `purchase/controllers/supplier-invoice.controller.ts`, `purchase/services/supplier-invoice.service.ts` |
| 3-way Matching | "missing" | Implemented: invoice vs PO vs GRN, flags `MATCHED` / `DISCREPANCY`. Lines 67-125 of `supplier-invoice.service.ts` |
| Debit Note | "missing" | Implemented. `purchase/controllers/debit-note.controller.ts`, `purchase/services/debit-note.service.ts` |
| Accounts Receivable | "missing" | Implemented. `finance/accounting/services/ar.service.ts`, `finance/accounting/controllers/ar.controller.ts` |
| B2B credit sale AR + Revenue journal | "missing" | Posted on order creation when `paymentMethod = ON_ACCOUNT`. `order.service.ts` lines 240-275 |
| Stock Transfers | "missing" | Two-leg ledger transfer endpoint exists. `inventory-ledger.service.ts::createStockTransfer` |
| Cycle Counts | "missing" | Variance adjustment endpoint exists. `inventory-ledger.service.ts::createCycleCount` |
| Accounting event coverage | only PURCHASE + SALE | Now PURCHASE, SALE COGS, ADJUSTMENT, RETURN, SUPPLIER_PAYMENT, PAYROLL. `accounting-integration.service.ts` |

Net effect: the **Procure-to-Pay** flow is now broadly continuous (PR → PO → GRN → Supplier Invoice with 3-way match → AP → Payment with journal). That is the single biggest improvement.

---

## 4. Real Defects Currently in the Codebase

These are concrete, reproducible defects — not opinions.

### 4.1 Unimplemented server method that will crash if called

`server/src/modules/admin/sales/order/repositoris/order.repository.ts:11`

```ts
findOne(arg0: { where: any; relations: string[] }) {
  throw new Error('Method not implemented.')
}
```

This shadows TypeORM's `findOne` shape. Any caller using a generic `findOne` style on this repository will fault at runtime.

**Fix:** delete the stub. Other typed methods on the class already cover the real query patterns.

### 4.2 Unimplemented `onChange` that throws when triggered

`client/features/admin/media/components/Media.tsx:159`

```tsx
<ImageUploadField
  ...
  onChange={function (val: string): void {
    throw new Error('Function not implemented.');
  }}
/>
```

If `ImageUploadField` invokes `onChange` during the upload flow (most components do), the entire Media library page crashes.

**Fix:** pass a no-op `() => {}` or wire `onChange` into local state.

### 4.3 React rules-of-hooks violation (Footer)

`client/components/layout/Footer.tsx` declares a nested `Newsletter` component:

```tsx
const Newsletter = () => {
  if (footerSettings?.showNewsletter === false) return null;
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  ...
};
```

The `useState` calls come *after* a conditional early return. Toggling `showNewsletter` at runtime produces inconsistent hook order and React will throw "Rendered fewer hooks than expected." This is also flagged twice by `react-hooks/rules-of-hooks`.

**Fix:** move both `useState` calls above the early return, or extract `Newsletter` to a separate top-level component.

### 4.4 Accounting failures are silently swallowed

`server/src/modules/admin/operations/finance/accounting/services/accounting-integration.service.ts:43-46`

```ts
} catch (error) {
  this.logger.error(
    `Failed to post financial entry for ledger ${ledgerEntry.id}: ${error.message}`,
  )
}
```

The parent business transaction still commits even if the journal post fails. This produces silent finance corruption — exactly the class of bug an ERP cannot afford.

**Fix:** propagate the error to roll back the parent transaction, OR write to an `accounting_events` outbox with `PENDING/POSTED/FAILED/RETRYING` and a reconciliation dashboard. The outbox path is what the older doc already recommends; this is the minimum viable hardening.

### 4.5 No idempotency keys anywhere

A repo-wide grep for `idempotencyKey`, `idempotency_key`, `clientSaleId`, `client_sale_id` returns results **only in docs**, never in code.

This means POS sync, order creation, GRN receiving, supplier payment, and shipment events can all duplicate when:
- BullMQ retries a job after a transient failure
- the client retries a failed HTTP call
- a future offline-POS client replays its queue

**Fix:** add `idempotencyKey` column with a unique-per-tenant constraint on `orders`, `pos_sales`, `grns`, `supplier_payments`, `shipments`. Reject duplicate keys by returning the original result.

### 4.6 No first-class `stock_reservations` table

The reservation lifecycle is still implemented by inserting `RESERVATION`-type rows into the inventory ledger and later reusing the same ledger for physical `SALE` movement. That mixes "committed but not shipped" with "physically gone" in one immutable stream:

- Available-to-Promise becomes a moving derivation of two transaction types on the same table.
- No reservation `expiresAt`, no `releasedQty`, no `fulfilledQty`, no clean release-on-cancel.
- No way to query "open reservations by warehouse" without scanning the ledger.

**Fix:** introduce `stock_reservations` as outlined in the older doc §12.

### 4.7 Brittle order-to-ledger linking pattern

`server/src/modules/admin/sales/order/services/order.service.ts` (~line 279):

```ts
await manager.update(
  InventoryLedgerEntity,
  { referenceType: InventoryTransactionReferenceType.ORDER, referenceId: null, tenantId },
  { referenceId: savedOrder.id },
)
```

This updates *every* tenant ledger row of type `ORDER` with `referenceId IS NULL`. Under concurrent order creation, rows from one in-flight order can be re-keyed to a different order, silently mis-attributing stock movements.

**Fix:** insert ledger rows with the final `referenceId` already set, or track the inserted IDs in memory and update only those.

---

## 5. Still Missing for "Complete ERP"

Carried forward from the older assessment and confirmed still missing today.

### Inventory / WMS
- True `stock_reservations` table with expiry/release/consume lifecycle.
- Warehouse sourcing engine — fulfillment still picks the first active warehouse.
- Stock transfer **documents** with DRAFT/APPROVED/IN_TRANSIT/RECEIVED/CANCELLED states. Current transfer is a single two-leg ledger insert.
- Cycle count **documents** with variance approval. Current cycle count adjusts immediately.
- Batch / lot / expiry tracking.
- Serial number tracking.
- Barcode / label printing.

### Accounting
- Posting for `TRANSFER`, `DAMAGE`, `INITIAL_BALANCE`, `RESERVATION`, `RESERVATION_CANCEL` inventory movements.
- Tax accounting — order revenue currently credits the full `totalAmount` to `4000 Revenue`; no separate tax-payable line.
- Journal **immutability** after posting.
- Journal **reversals** (vs editing).
- **Fiscal periods** and period close controls.
- **Accounting outbox** (linked to §4.4) with retry/reconciliation dashboard.

### POS
- True offline-first sync: no IndexedDB queue, no service worker, no `clientSaleId` uniqueness on backend.
- Multi-payment splits (cash + card + mobile on one sale).
- Cash drawer movements (paid in, paid out, cash drop, safe transfer).
- POS-integrated returns/exchanges with accounting + inventory reversal.

### CRM / Customer / Loyalty
- Customer credit limits.
- AR aging buckets, dunning.
- Loyalty rules engine, points expiration, tier transitions.
- Customer segmentation.

### HRM
- Move HRM demo/schema-repair code out of the production service surface.
- Real payroll derivation from attendance + leave + overtime + tax + benefits + approvals.
- Performance review aggregation (currently a placeholder).
- Remove hardcoded onboarding password pattern; use secure reset link.

### Cross-cutting
- Idempotency keys (§4.5).
- Integration tests for ERP invariants (one sale reserves once, one shipment deducts once, one event posts once).
- Cache invalidation on domain events (stock-on-hand, AP, AR, reports).
- Permission coverage tests on high-risk endpoints (adjust stock, approve transfer, post/reverse journal, run payroll, override credit limit).

---

## 6. Module Coverage Matrix (Current)

| Area | What exists | Current status | Δ vs 2026-05-20 |
| :--- | :--- | :--- | :--- |
| Organization | Branches, warehouses, bins | Mostly implemented | unchanged |
| Inventory / WMS | Ledger, summary, low-stock, adjustments, stock-transfer, cycle-count | Partial — basic transfers and counts added, no documents/approvals | **improved** |
| Procurement | Supplier, PR, RFQ, PO, GRN, Supplier Invoice + 3-way match, Debit Note, AP, Payment | Mostly implemented | **significantly improved** |
| Finance / Accounting | COA, journals, AR, P&L, balance sheet; postings for PURCHASE, SALE, ADJUSTMENT, RETURN, SUPPLIER_PAYMENT, PAYROLL | Partial — broader coverage, but TRANSFER/DAMAGE/RESERVATION/TAX still uncovered, no reversal/period close | **improved** |
| POS / Retail | Register, shift, cart, sale sync, receipt | Partial — still online-only, no offline queue or idempotency | unchanged |
| Fulfillment | Pick, pack, ship + SALE ledger on shipment | Partial — no sourcing/split | unchanged |
| HRM | Employees, attendance, leave, payroll, recruitment, performance | Prototype + partial production | unchanged |
| RBAC / Access | Dynamic roles, permissions, branch scope | Mostly implemented | unchanged |
| CRM / Loyalty / AR | AR sub-ledger now exists; credit limits, aging, loyalty rules incomplete | Partial | **improved (AR)** |
| BI / Reporting | Dashboards, P&L, balance sheet, ledger views | Partial | unchanged |
| Subscription / Billing | Plans, subscription billing, public plan endpoint | Implemented | unchanged |

---

## 7. ERP Maturity Score (Updated)

| Capability | Score | Δ vs 2026-05-20 |
| :--- | :---: | :---: |
| Multi-tenant foundation | 7/10 | — |
| Organization model | 7/10 | — |
| Inventory ledger | 6/10 | — |
| Procurement | **7/10** | **+2** (PR, RFQ, Supplier Invoice + 3-way, Debit Note) |
| Finance / accounting | **6/10** | **+1** (broader posting + AR) |
| POS | 5/10 | — |
| Fulfillment | 5/10 | — |
| HRM | 5/10 | — |
| RBAC / access | 7/10 | — |
| CRM / loyalty / AR | **3/10** | **+1** (AR sub-ledger) |
| Reporting / BI | 4/10 | — |

**Approximate ERP readiness:** ~60-65% for an internal alpha, ~35-45% for production ERP use.

---

## 8. Prioritized Fix-Now List

Order of business risk.

1. **(Bug)** Delete or wire `onChange` in `client/features/admin/media/components/Media.tsx:159`. (1-line fix)
2. **(Bug)** Move the two `useState` calls in `Footer.tsx::Newsletter` above the early return. (1-line move)
3. **(Bug)** Delete the bogus `findOne` stub in `server/.../order.repository.ts:11`. (3-line removal)
4. **(Invariant)** Stop swallowing accounting integration errors (§4.4). Roll back the parent transaction OR write to an outbox.
5. **(Invariant)** Add `idempotencyKey` with unique-per-tenant constraint to `orders`, `pos_sales`, `grns`, `supplier_payments`, `shipments`.
6. **(Bug)** Scope the post-insert ledger-reference update in `order.service.ts` to the rows just inserted, instead of matching `referenceId IS NULL` tenant-wide.
7. **(Hygiene)** Run `eslint --fix` on the server to clear the 587 prettier errors.
8. **(Hygiene)** Fix the 2 `react-hooks/rules-of-hooks` and 2 `react-hooks/purity` issues on the client; triage the 47 `exhaustive-deps` and 21 `set-state-in-effect` findings.
9. **(Foundation)** Begin the `stock_reservations` table and ATP query — this unlocks correct fulfillment sourcing, split shipments, and offline POS later.

---

## 9. Dependency Notes

- `client/package.json` declares `"mongoose": "^9.0.0"`. The backend uses TypeORM/Postgres; if Mongo is not used in the client, this is dead weight. Remove or justify.
- `client/package.json` declares `"baseline-browser-mapping": "^2.8.32"` — not a typical Next.js dep. Likely unused.
- Server is on NestJS 11 + TypeORM 0.3 + BullMQ + Socket.IO + Joi + Zod. Client is on Next.js 16 + React 19 + Tailwind 4. Stack is current.

---

## 10. Final Senior Engineering Verdict

This project has crossed the line from "eCommerce admin with ERP modules" to "ERP-shaped codebase with most module surfaces wired end-to-end." The 2026-05-21 delta over 2026-05-20 is real, especially in Procure-to-Pay.

The next focus must remain **business invariants, not screens**:

- one sale reserves stock once;
- one shipment deducts stock once;
- one business event posts to accounting once and cannot silently fail;
- every purchase reconciles PO ↔ GRN ↔ Supplier Invoice ↔ AP ↔ Payment;
- every high-risk ERP action has permission, audit, and reversal/approval logic.

Add idempotency, a real reservation model, full accounting coverage with an outbox, and offline-first POS, and this becomes a credible ERP. Until then it should not be the financial/inventory system of record for a real multi-branch business.

---

*This assessment is based on static code and documentation analysis only. The application was not run and tests were not executed. `tsc --noEmit` and `eslint` were run on both `server/` and `client/` to verify the build and lint claims above.*
