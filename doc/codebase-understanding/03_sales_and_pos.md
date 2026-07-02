# Codebase Understanding — Sales & Point-of-Sale (POS) Modules

This document details the codebase with **verified field-level accuracy** from the actual TypeScript source code.

---

## Module Locations

```
server/src/modules/admin/sales/
├── order/
│   ├── entities/
│   │   ├── order.entity.ts           # Customer purchase transaction
│   │   ├── order-item.entity.ts      # Line items per order
│   │   └── order-return.entity.ts    # Return requests
│   ├── services/                     # Order lifecycle, stock holds, coupon validation
│   ├── repositoris/                  # DB access layer (note: typo in codebase)
│   ├── queue/                        # BullMQ job handlers
│   └── order.module.ts
├── pos/
│   ├── entities/
│   │   ├── pos-register.entity.ts    # Physical checkout terminal
│   │   ├── pos-shift.entity.ts       # Cashier session (open/close)
│   │   └── pos-drawer-transaction.entity.ts  # Cash in/out events
│   ├── pos.service.ts                # Core POS logic (~24KB)
│   ├── pos.controller.ts             # All POS API endpoints (~8KB)
│   └── pos.module.ts
├── coupon/                           # Coupon CRUD and validation
├── promotion/                        # Campaign strategy pattern
├── payment/                          # Payment record tracking
└── cart/                             # (Storefront-facing — see doc 10)
```

---

## 1. `OrderEntity` (`order/entities/order.entity.ts`)

> **Verified from source**

| Field | Type | Notes |
| :--- | :--- | :--- |
| `customerName` | VARCHAR(255) | Snapshot name at order time |
| `customerEmail` | VARCHAR(255) | Snapshot email |
| `customerPhone` | VARCHAR(50) | Snapshot phone |
| `address` | TEXT | Delivery address text snapshot |
| `shippingAddressId` | UUID FK (nullable) | Links to saved `ShippingAddressEntity` |
| `totalAmount` | DECIMAL(10,2) | Grand total including tax and shipping |
| `shippingFee` | DECIMAL(10,2) | Courier charge |
| `currency` | VARCHAR(10) | Default `BDT` |
| `currencyRate` | DECIMAL(10,4) | Exchange rate at order time |
| `status` | ENUM `OrderStatus` | PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| `orderSource` | ENUM `OrderSource` | WEBSITE, POS, ADMIN, API |
| `paymentMethod` | ENUM `PaymentMethod` | CASH, CARD, MOBILE_BANKING, COD, WALLET |
| `paymentStatus` | ENUM `PaymentStatus` | PENDING, PARTIAL, PAID, REFUNDED |
| `transactionId` | VARCHAR(255, nullable) | Payment gateway reference |
| `appliedCoupon` | VARCHAR(50, nullable) | Coupon code used at checkout |
| `couponDiscountAmount` | DECIMAL(10,2) | Discount deducted from total |
| `taxAmount` | DECIMAL(10,2) | Tax applied |
| `walletDeductionAmount` | DECIMAL(10,2) | Store credit used at checkout |
| `offlineSaleId` | UUID (nullable, UNIQUE) | POS offline sync idempotency key (`clientSaleId`) |
| `payments` | JSONB (nullable) | Array of `{method, amount, transactionId}` — supports split payment |
| `trackingId` | VARCHAR (nullable) | Courier tracking number |
| `courierStatus` | VARCHAR (nullable) | Latest courier webhook status |
| `deliveryZone` | VARCHAR (nullable) | Delivery zone label |
| `orderNotes` | TEXT (nullable) | Customer/admin notes |
| `storeId` | UUID FK | Strict store isolation |

> **Key Design:** `offlineSaleId` maps to the POS terminal's `clientSaleId`. The UNIQUE constraint ensures a POS sale synced multiple times is processed exactly once (idempotency).

> **Key Design:** `payments` JSONB allows a single order to record multiple payment methods (e.g. BDT 500 cash + BDT 300 wallet) without a separate payment table per order.

---

## 2. `PosShiftEntity` (`pos/entities/pos-shift.entity.ts`)

> **Verified from source**

| Field | Type | Notes |
| :--- | :--- | :--- |
| `branchId` | UUID FK (nullable) | Branch this shift belongs to |
| `registerId` | UUID FK | The POS register terminal |
| `userId` | UUID FK | The cashier who opened the shift |
| `status` | ENUM `PosShiftStatus` | OPEN, CLOSED |
| `openingTime` | TIMESTAMPTZ | When shift started |
| `closingTime` | TIMESTAMPTZ (nullable) | When shift was closed |
| `openingBalance` | DECIMAL(12,2) | Cash float at shift start |
| `closingBalance` | DECIMAL(12,2, nullable) | Cash counted at shift end |
| `cashSales` | DECIMAL(12,2) | Accumulated cash sales total |
| `cardSales` | DECIMAL(12,2) | Accumulated card/POS machine sales |
| `mobileSales` | DECIMAL(12,2) | Accumulated mobile banking payments |
| `cashIn` | DECIMAL(12,2) | Additional cash added to drawer mid-shift |
| `cashOut` | DECIMAL(12,2) | Cash removed from drawer mid-shift |
| `expectedClosingBalance` | DECIMAL(12,2) | System-computed expected cash |
| `difference` | DECIMAL(12,2, nullable) | `closingBalance - expectedClosingBalance` (variance) |
| `remarks` | TEXT (nullable) | Cashier notes on variance |
| `storeId` | UUID FK | Strict store isolation |

> **Reconciliation Formula:** `expectedClosingBalance = openingBalance + cashSales + cashIn - cashOut`

---

## 3. `StockReservationEntity` (`inventory-transaction/entities/stock-reservation.entity.ts`)

> **Verified from source** — This is significantly more detailed than previously documented.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `productId` | UUID FK | Product reserved |
| `variantId` | UUID FK (nullable) | Specific variant if applicable |
| `warehouseId` | UUID FK (nullable) | Which warehouse holds the reservation |
| `orderId` | UUID FK (nullable) | Source order driving the reservation |
| `reservedQty` | DECIMAL(12,2) | **Immutable** — original qty locked, never mutated |
| `fulfilledQty` | DECIMAL(12,2) | Grows as shipments consume the reservation |
| `releasedQty` | DECIMAL(12,2) | Quantity explicitly cancelled/released |
| `status` | ENUM `ReservationStatus` | ACTIVE, FULFILLED, RELEASED, EXPIRED |
| `expiresAt` | TIMESTAMPTZ (nullable) | Null = never auto-expires; set for cart checkouts |
| `reservedAt` | TIMESTAMPTZ | When reservation was created |
| `releasedAt` | TIMESTAMPTZ (nullable) | When stock was returned to available |
| `notes` | TEXT (nullable) | Reason or context |
| `storeId` | UUID FK | Strict store isolation |

> **Available-to-Promise (ATP) formula:**
> ```
> availableStock = stockOnHand - SUM(reservedQty - fulfilledQty - releasedQty)
>                                WHERE status = 'ACTIVE'
> ```

**Unique Constraint:** `(storeId, orderId, productId, variantId)` — prevents duplicate reservations for the same order line.

---

## 4. Key API Endpoints

### Orders
| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/sales/orders` | Create a new sales order |
| `GET` | `/api/admin/sales/orders` | List orders with filters (status, date, source) |
| `GET` | `/api/admin/sales/orders/:id` | Get order details with items |
| `PATCH` | `/api/admin/sales/orders/:id/status` | Update order status |
| `POST` | `/api/admin/sales/orders/:id/return` | Initiate a return request |

### POS
| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/sales/pos/shifts/open` | Open a cashier shift with opening cash float |
| `POST` | `/api/admin/sales/pos/shifts/:id/close` | Close shift with counted cash |
| `POST` | `/api/admin/sales/pos/sync` | Sync a batch of offline POS sales |
| `GET` | `/api/admin/sales/pos/shifts` | List shifts (filter by branch, date, cashier) |
| `POST` | `/api/admin/sales/pos/drawer` | Record a mid-shift cash-in or cash-out |
