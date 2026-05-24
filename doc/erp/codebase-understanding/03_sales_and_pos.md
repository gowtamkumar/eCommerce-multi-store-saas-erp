# Codebase Understanding — Sales & Point-of-Sale (POS) Modules

This document details the codebase architecture, database entities, and workflows for online orders, cashier registers, cashier shifts, payment allocations, and promotional discount strategies.

---

## 1. Sales Order Domain

Located at: `server/src/modules/admin/sales/order/`.

### 1.1 Database Entities
*   **`OrderEntity` (`entities/order.entity.ts`):**
    Represents customer purchase transactions (storefront or admin-created). Contains columns like `orderNumber`, `status` (PENDING, PAID, SHIPPED, COMPLETED, CANCELLED), `paymentStatus` (UNPAID, PARTIAL, PAID), `totalAmount`, `subtotal`, `taxAmount`, and relationships to user/customer.
*   **`OrderItemEntity` (`entities/order-item.entity.ts`):**
    Individual line items. Stores `variantId`, `qty`, `unitPrice` snapshot, `taxRate` snapshot, `discountAmount` snapshot, and fulfillment status.
*   **`OrderReturnEntity` (`entities/order-return.entity.ts`):**
    Manages stock reversals and refund distributions. Tracks `status` (PENDING, APPROVED, REFUNDED).

### 1.2 Services & Controllers
*   **`OrderService` (`services/order.service.ts`):**
    Drives order creation, applies discount coupon validation rules, places temporary stock holds, maps payments, and emits `order.paid` when transactions complete.

### 1.3 Key API Endpoints
*   `POST /api/admin/sales/orders` — Create a draft or standard sales order.
*   `POST /api/admin/sales/orders/:id/return` — Initiate a purchase return request.

---

## 2. Point-of-Sale (POS) Domain

Located at: `server/src/modules/admin/sales/pos/`.

### 2.1 Database Entities
*   **`PosRegisterEntity` (`entities/pos-register.entity.ts`):**
    Represents a physical checkout counter machine mapped to a specific branch. Holds columns like `registerCode`, `name`, `status` (ACTIVE, INACTIVE).
*   **`PosShiftEntity` (`entities/pos-shift.entity.ts`):**
    Cashier session. Tracks shift boundaries (`openedAt`, `closedAt`), cashier `userId`, expected cash drawer totals, actual counted drawer totals, cash variance, and shift status (OPEN, CLOSED).
*   **`PosDrawerTransactionEntity` (`entities/pos-drawer-transaction.entity.ts`):**
    Tracks cash inflows and outflows from the drawer (e.g. cash drops, payouts, opening cash floats).

### 2.2 Core Logic & Services
*   **`PosService` (`pos.service.ts`):**
    Implements POS register assignments, shift open/close reconciliation math, and parses the offline sales queue payload. The sync logic validates the transaction UUID (`clientSaleId`), posts stock deductions, and hooks ledger postings.
*   **`PosController` (`pos.controller.ts`):**
    Provides API paths for registers, opening cashier shifts, logging cash transactions, and synchronizing offline checkout queues.

### 2.3 Key API Endpoints
*   `POST /api/admin/sales/pos/shifts/open` — Open a cashier shift and log the opening cash float.
*   `POST /api/admin/sales/pos/sync` — Synchronize a batch of offline checkouts from a local IndexedDB buffer.
*   `POST /api/admin/sales/pos/shifts/:id/close` — Close shift and record cashier's actual counted cash.

---

## 3. Pricing, Coupons & Promotions Domain

Located at: `server/src/modules/admin/sales/coupon/` and `server/src/modules/admin/sales/promotion/`.

### 3.1 Code Architecture
*   **Strategy Pattern Integration:**
    Promotions rely on a strategy pattern factory to isolate calculations. 
    `DiscountStrategyFactory` instantiates discount calculators:
    *   `PercentageDiscountStrategy`
    *   `FixedAmountDiscountStrategy`
    *   `FreeShippingDiscountStrategy`
*   **`CouponService`:**
    Validates coupon validity (expiry dates, minimum cart totals, branch rules, and tenant allocation limits).
