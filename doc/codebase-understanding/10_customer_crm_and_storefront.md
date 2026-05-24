# Codebase Understanding — Customer (CRM), Store Wallet & Storefront Cart

This document covers the customer relationship management (CRM) data layer, the store-facing cart and wishlist, customer wallet/store credit, and the lead capture pipeline.

---

## Module Locations

```
server/src/modules/admin/customer/    # Admin-side CRM management
├── lead/                             # Sales lead capture and pipeline
│   ├── entities/
│   │   └── lead.entity.ts
│   ├── lead.service.ts
│   ├── lead.repository.ts
│   └── lead.controller.ts
├── subscriber/                       # Newsletter/mailing list subscribers
└── customer.controller.ts            # Customer profile admin CRUD

server/src/modules/store/             # Customer-facing storefront modules
├── cart/                             # Shopping cart management
│   ├── entities/                     # Cart and CartItem entities
│   ├── cart.service.ts               # Add/remove/checkout helpers (~10KB)
│   ├── cart.repository.ts
│   └── cart.controller.ts
├── wishlist/                         # Saved products list
├── shipping-address/                 # Customer saved addresses
└── wallet/                           # Store credit (customer-facing reads)
    └── store-wallet.controller.ts
```

---

## 1. Customer Profile (Admin CRM)

### Where Customers Live
Customer identity records are stored in the **`UserEntity`** (shared with staff) inside `server/src/modules/admin/core/user/entities/user.entity.ts`. They are differentiated by:
- `isStaff: false` — marks the record as a customer (not a staff member)
- `membershipTier` — loyalty tier (BRONZE, SILVER, GOLD, PLATINUM)
- `creditLimit` — B2B order-on-credit cap
- `creditHold` — boolean to freeze future orders

### Customer-Specific Fields in `UserEntity`
| Field | Purpose |
| :--- | :--- |
| `membershipTier` | Controls loyalty points multiplier and discount eligibility |
| `creditLimit` | Max cumulative outstanding AR balance allowed |
| `creditHold` | When `true`, all new order placement is blocked at service level |
| `preferredBranchId` | Informational — used for branch-targeted campaigns |
| `loyaltyPoints` | Running loyalty balance (derived from `LoyaltyLedgerEntity`) |

---

## 2. CRM Subledgers

Three parallel ledger tables track secondary customer balances:

### `WalletLedgerEntity` (`accounting/entities/wallet-ledger.entity.ts`)
Store credit wallet. Append-only:
- Positive `amount` = credit added (refund, gift, top-up)
- Negative `amount` = credit spent (applied at checkout)
- `runningBalance` = current wallet balance snapshot

### `ArLedgerEntity` (`accounting/entities/ar-ledger.entity.ts`)
B2B Accounts Receivable subledger:
- `debit` = new invoice raised against the customer
- `credit` = payment received from the customer
- `runningBalance` = outstanding debt

### Loyalty Ledger (`marketing/loyalty/`)
Points tracking:
- Positive `points` = earned on purchase
- Negative `points` = redeemed at checkout
- `runningBalance` = current point balance

---

## 3. Lead Management (`customer/lead/`)

### `LeadEntity` (`entities/lead.entity.ts`)
Captures prospective customer enquiries and sales opportunities:
| Field | Description |
| :--- | :--- |
| `name`, `email`, `phone` | Contact details |
| `source` | Origin (WEBSITE_FORM, SOCIAL_MEDIA, WALK_IN, REFERRAL) |
| `status` | Pipeline stage (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST) |
| `assignedTo` | Staff user responsible for follow-up |
| `notes` | Free-text interaction notes |
| `convertedToUserId` | When lead converts, links to the created `UserEntity` |

### `LeadService`
- `createLead()` — Create from web form or manual entry
- `updateStatus()` — Move through pipeline stages
- `convertToCustomer()` — Create a proper `UserEntity` and link `convertedToUserId`

---

## 4. Subscriber Module (`customer/subscriber/`)

Manages newsletter mailing list opt-ins from the storefront. Stores email, consent timestamp, and subscription preferences.

---

## 5. Storefront Cart (`store/cart/`)

### Architecture
The cart is a **server-side persistent cart** (not browser localStorage-only), allowing customers to resume their cart across devices.

### Entities
- **`CartEntity`:** One cart per active user session. Fields: `userId`, `tenantId`, `status` (ACTIVE, CHECKED_OUT, ABANDONED).
- **`CartItemEntity`:** Line items in the cart. Fields: `variantId`, `quantity`, `unitPriceSnapshot`, `discountSnapshot`.

### `CartService` Key Methods
| Method | Description |
| :--- | :--- |
| `addItem(ctx, variantId, qty)` | Add or increment a cart item; checks real-time stock availability |
| `removeItem(ctx, cartItemId)` | Remove a line from the cart |
| `applyPromotion(ctx, couponCode)` | Validate coupon and apply discount snapshot to cart |
| `getCartSummary(ctx)` | Return totals: subtotal, discount, tax, grand total |
| `checkout(ctx)` | Convert cart to a confirmed `OrderEntity`; triggers stock reservation |

### Stock Check on Add-to-Cart
Before adding an item, `CartService` calls `StockAvailabilityService`:
```
availableQty = stockOnHand − activeReservations
```
If `availableQty < requestedQty`, returns an error with available quantity.

---

## 6. Wishlist (`store/wishlist/`)

Allows customers to save products for later purchase. Simple join table mapping `userId` ↔ `variantId`. Wishlisted items show real-time availability status on the storefront.

---

## 7. Shipping Address (`store/shipping-address/`)

Stores customer delivery addresses for quick reuse at checkout. Fields: `label` (Home, Office), `recipientName`, `phone`, `street`, `city`, `district`, `postalCode`, `isDefault`.

---

## 8. Store Wallet (Customer-Facing) (`store/wallet/`)

The `StoreWalletController` exposes read-only endpoints for authenticated customers to:
- Check wallet balance
- View transaction history (credit adds and deductions)

Write operations (crediting wallets) are exclusively executed from the admin/accounting layer.
