# Price Books Assignment & Resolution Guide

This guide details how each of the four Price Book types (`RETAIL`, `PROMOTIONAL`, `WHOLESALE`, `CUSTOMER_SPECIFIC`) is mapped to customers, resolved by the engine, and used in real-world retail and B2B scenarios.

---

## 1. Summary Matrix: Target Audiences & Assignment Methods

| Price Book Type | Target Audience | How it is Assigned | Auto-Applied on Storefront? |
| :--- | :--- | :--- | :--- |
| **`RETAIL`** | Guests, anonymous shoppers, and default retail accounts. | **Implicit Fallback**: Auto-resolved by the pricing engine if no specific code or promotional campaign matches. | **Yes** (Default storefront price) |
| **`PROMOTIONAL`** | All active storefront shoppers during a specific campaign window. | **Scheduled Window**: Auto-applied by the engine if the current timestamp falls between `validFrom` and `validTo`. | **Yes** (During scheduled dates) |
| **`WHOLESALE`** | Bulk buyers, B2B merchants, and corporate retailers. | **Account Role/Quantity**: Triggered when a wholesale customer logs in or when bulk order thresholds are reached. | **No** (Requires wholesale role/segment validation) |
| **`CUSTOMER_SPECIFIC`** | VIP individuals, loyalty tier members, and contract accounts. | **Customer Entity/Segment Link**: Directly mapped to a customer profile, CRM segment, or manually by a sales representative. | **No** (Requires explicit customer profile matching) |

---

## 2. In-Depth Scenarios & Configuration Examples

### A. RETAIL (Base Storefront pricing)
- **Real-World Scenario**: A guest walks into the online shop anonymously, searches for a product, and sees standard retail prices.
- **How it is Defined & Resolved**:
  - The merchant creates a price book with type `RETAIL` and code `DEFAULT-BDT`.
  - When the cart resolves pricing, no `priceBookCode` is passed (it is `null` or undefined).
  - The pricing engine falls back to search for the active `RETAIL` book matching the storefront's active currency.
- **Data Resolution Flow**:
  ```
  Checkout request (priceBookCode: null) 
    ↳ Pricing Service queries active RETAIL price book
      ↳ Cotton Polo shirt → 500 BDT unit price is applied.
  ```

---

### B. PROMOTIONAL (Time-Bounded Campaigns)
- **Real-World Scenario**: The store runs an "Eid Holiday Sale" from May 20 to May 27. Any customer visiting during this period receives discounted pricing automatically without needing to type a promo code.
- **How it is Defined & Resolved**:
  - The merchant creates a price book of type `PROMOTIONAL`, code `EID-2026`, and configures `validFrom` and `validTo`.
  - During this window, when any shopper checks out, the pricing service queries for active `PROMOTIONAL` price books.
  - Since the current date is within the window, the engine selects `EID-2026` automatically.
- **Data Resolution Flow**:
  ```
  Shopper visits on May 24 (within Eid campaign window)
    ↳ Pricing Service detects active PROMOTIONAL book (EID-2026)
      ↳ Promotional pricing takes precedence over RETAIL
        ↳ Cotton Polo shirt → 400 BDT sale price is applied.
  ```

---

## 3. How to Assign WHOLESALE & CUSTOMER-SPECIFIC Catalogs

Because B2B wholesale rates and VIP contract prices must be protected from leakage, they are never resolved as auto-applied fallbacks on standard guest storefronts. Here is how they are mapped and activated:

### C. WHOLESALE (B2B Bulk / Account Role Catalog)
- **Real-World Scenario**: A corporate partner or wholesale reseller wants to purchase bulk inventory. They log in with their corporate account and instantly see lower unit costs.
- **How it is Assigned & Resolved**:
  
  #### Method 1: Direct Customer Profile Assignment (Implemented)
  The customer profile contains a direct `priceBookCode` mapping.
  ```typescript
  // User entity contains a linked pricing code
  interface User {
      id: string;
      email: string;
      role: 'USER' | 'WHOLESALE_BUYER' | 'ADMIN';
      priceBookCode: string | null; // e.g. "WHOLESALE"
  }
  ```
  When the wholesale customer logs in, their session context carries their assigned `priceBookCode`. The storefront cart and checkout pricing services automatically resolve and apply their custom catalog prices.

  #### Method 2: Quantity Triggered Checkout (Future Backlog)
  The shopping cart detects if the total quantity of items meets wholesale thresholds (e.g. 50+ items), and dynamically switches the query code to `WHOLESALE`.

- **Data Resolution Flow**:
  ```
  B2B buyer logs in (context.user.priceBookCode = 'WHOLESALE')
    ↳ Checkout API calls getApplicablePrice(..., priceBookCode: 'WHOLESALE')
      ↳ Engine matches the wholesale catalog and evaluates tier levels
        ↳ Cotton Polo shirt (Qty: 25) → 300 BDT bulk unit price applied.
  ```

---

### D. CUSTOMER_SPECIFIC (VIP Contract / CRM Segment Catalog)
- **Real-World Scenario**: A specific corporate account ("ABC Tech Corp") signs a contract for special hardware pricing. Alternatively, loyal individual shoppers in the "Gold Loyalty Tier" get exclusive pricing.
- **How it is Assigned & Mapped**:
  Since this targets specific individuals or segments, we configure this mapping via three main developer avenues:

  #### Method 1: Customer Profile Field (Implemented)
  Under the Admin CRM portal, the merchant edits the customer profile (in the B2B tab) and selects their exclusive pricing catalog from the **"Assigned Price Book"** dropdown:
  - **Database level**: `users.price_book_code` persists the code (e.g., `'VIP-GOLD'`).
  - **Resolution**: When the user logs in and browses the site, their session context automatically fetches their `priceBookCode` (e.g., `'VIP-GOLD'`) and uses it for storefront cart pricing (`CartService.transformCart()`) and order checkout pricing (`OrderService.create()`).

  #### Method 2: CRM Segment mapping (Group Assign - Future Backlog)
  We can link CRM Audience segments or Loyalty Tiers to a specific price book:
  - Create a relational mapping table `customer_segments_price_books`:
    ```sql
    CREATE TABLE customer_segments_price_books (
        segment_id UUID REFERENCES customer_segments(id),
        price_book_id UUID REFERENCES price_books(id),
        tenant_id UUID NOT NULL
    );
    ```
  - When a customer is added to the "Platinum Loyalty Tier", the system resolves their group price book code (`VIP-PLATINUM`) dynamically based on their active segment membership.

  #### Method 3: Sales Rep / Cashier Manual Override (Implemented via Checkout)
  When a sales representative creates an order (or when checkout APIs are invoked), they can explicitly specify a `priceBookCode` in the request payload. In `OrderService`, the explicit request code overrides the customer's default assigned price book code.

- **Data Resolution Flow**:
  ```
  Admin creates manual invoice for client ABC Tech
    ↳ Admin selects ABC-TECH-CONTRACT price book in order panel
      ↳ Order processor calls getApplicablePrice(..., priceBookCode: 'ABC-TECH-CONTRACT')
        ↳ Cotton Polo shirt → 250 BDT contract price applied.
  ```

---

## 4. Volume / Tier Pricing — How `minQuantity` Works Per Type

Each price book can hold **multiple tier rows per product**, sorted by `minQuantity`. The engine always picks the **highest matching tier** for the ordered quantity.

### A. Technical Implementation & Database Schema

Under the hood, price tiers are stored in the `product_prices` table. The schema maps a price to a specific product (and optionally, a specific product variant), scoped to a single `priceBook` and a `tenantId`.

#### `ProductPriceEntity` Schema Structure
- `id`: UUID (Primary Key)
- `priceBookId`: UUID (Foreign Key to `price_books`)
- `productId`: UUID (Foreign Key to `products`)
- `variantId`: UUID | null (Foreign Key to `product_variants`, optional for variant-specific tiers)
- `minQuantity`: integer (Minimum quantity required to qualify for this price tier, defaults to `1`)
- `price`: decimal (The unit price for this tier)
- `tenantId`: UUID (Multi-tenant scoping)

---

### B. Resolution Algorithm (Pricing Engine)

When an item is added to the cart or checkout occurs, the pricing resolution algorithm fetches all matching price rows for that product (or variant) within the active price book, ordered by `minQuantity` in **descending** order. 

It then performs a single-pass scan to find the first tier that satisfies `orderedQuantity >= tier.minQuantity`.

```typescript
// From server/src/modules/admin/catalog/pricing/pricing.service.ts
async getApplicablePrice(
  productId: string,
  variantId: string | null,
  quantity: number,
  priceBookCode: string | null | undefined,
  tenantId: string,
) {
  // ... Price book resolution omitted ...
  
  let applicablePrice = null;

  // 1. Try to find variant-specific price first
  if (variantId) {
    const variantPrices = await this.productPriceRepo.find({
      where: { priceBookId: pb.id, productId, variantId, tenantId },
      order: { minQuantity: 'DESC' },
    });
    applicablePrice = variantPrices.find((p) => quantity >= p.minQuantity);
  }

  // 2. Fall back to base product price if no variant price found
  if (!applicablePrice) {
    const basePrices = await this.productPriceRepo.find({
      where: { priceBookId: pb.id, productId, variantId: IsNull(), tenantId },
      order: { minQuantity: 'DESC' },
    });
    applicablePrice = basePrices.find((p) => quantity >= p.minQuantity);
  }

  return applicablePrice ? Number(applicablePrice.price) : null;
}
```

---

### C. Example Scenarios: Cotton Polo Shirt

#### RETAIL Book (`DEFAULT-BDT`)
| Min Quantity | Unit Price (BDT) | Buyer Type |
| ---: | ---: | :--- |
| 1 | 500 | Any guest or regular shopper |
| 5 | 480 | Small bulk (5–9 units) |
| 10 | 460 | Medium bulk (10–24 units) |

> **Evaluation**: If a customer orders **7 units**, the engine loads tiers `[10, 5, 1]` sorted descending.
> - Tier `minQuantity: 10` → `7 >= 10` is **False**.
> - Tier `minQuantity: 5` → `7 >= 5` is **True** ✅.
> - **Result**: `480 BDT` each.

#### WHOLESALE Book (`WHOLESALE`)
| Min Quantity | Unit Price (BDT) | Buyer Type |
| ---: | ---: | :--- |
| 25 | 360 | Corporate resellers (25–49 units) |
| 50 | 310 | Large corporate (50–99 units) |
| 100 | 270 | Factory-level bulk (100+ units) |

> **Evaluation**: If a wholesale buyer orders **60 units**, the engine loads tiers `[100, 50, 25]` sorted descending.
> - Tier `minQuantity: 100` → `60 >= 100` is **False**.
> - Tier `minQuantity: 50` → `60 >= 50` is **True** ✅.
> - **Result**: `310 BDT` each.

#### PROMOTIONAL Book (`EID-2026`, active May 20–27)
| Min Quantity | Unit Price (BDT) | Buyer Type |
| ---: | ---: | :--- |
| 1 | 400 | All buyers during sale window |
| 10 | 380 | Bulk buyers during sale window |

> **Evaluation**: During the Eid window, even a guest buying 1 unit gets the **400 BDT** promotional rate automatically (`1 >= 1` is True).

---

## 5. Complete Price Resolution Priority Map

The following matrix shows which price book is selected based on **who is buying**, **when**, and **how many units**:

| Customer Type | Date | Qty | priceBookCode | Book Selected | Unit Price |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Anonymous guest | Normal day | 1 | `null` | RETAIL | 500 BDT |
| Anonymous guest | During Eid sale | 1 | `null` | PROMOTIONAL | 400 BDT |
| Anonymous guest | During Eid sale | 12 | `null` | PROMOTIONAL | 380 BDT |
| Regular customer | Normal day | 5 | `null` | RETAIL | 480 BDT |
| Wholesale account | Any day | 60 | `WHOLESALE` | WHOLESALE | 310 BDT |
| VIP Gold member | Any day | 1 | `VIP-GOLD` | CUSTOMER_SPECIFIC | 420 BDT |
| Sales rep (manual invoice) | Any day | 1 | `ABC-TECH-CONTRACT` | CUSTOMER_SPECIFIC | 250 BDT |
| Wholesale account | During Eid sale | 1 | `WHOLESALE` | WHOLESALE (explicit wins) | 360 BDT |

> **Important**: An **explicit `priceBookCode`** always wins over automatic PROMOTIONAL fallback. A wholesale buyer checking out through the B2B portal **will never accidentally get the Eid promotional book** — they always stay on their contracted wholesale pricing.

---

## 6. Conflict & Edge Case Handling

### Scenario 1: Two RETAIL books active simultaneously
> **Blocked by backend validation.** When an admin tries to activate a second `RETAIL` price book for the same currency (e.g., `BDT`), the backend throws:
> ```
> 400 Bad Request: An active RETAIL price book for currency BDT already exists
> ("Default Retail BDT"). Only one active RETAIL book is allowed per currency.
> ```
> **Resolution**: Deactivate the existing RETAIL book before creating or activating a new one.

### Scenario 2: A PROMOTIONAL book with no dates
> **Blocked by validation.** Saving a `PROMOTIONAL` price book without both `validFrom` and `validTo` returns:
> ```
> 400 Bad Request: Promotional price books require both Valid From and Valid To dates.
> ```

### Scenario 3: A PROMOTIONAL book where `validTo < validFrom`
> **Blocked by validation.**
> ```
> 400 Bad Request: Valid To date must be chronologically after the Valid From date.
> ```

### Scenario 4: WHOLESALE book and active Eid PROMOTIONAL — which wins?
> **Answer: The PROMOTIONAL book wins** for unauthenticated shoppers and regular buyers (auto-resolution). WHOLESALE buyers using their explicit `priceBookCode` stay on the WHOLESALE book. Never mixed.

### Scenario 5: A CUSTOMER_SPECIFIC book has no tiers for a product
> The engine resolves the CUSTOMER_SPECIFIC book but finds no tier rows for that product → falls back to the product's core `.price` field. This is expected behavior. Add tier rows to the book to override.

### Scenario 6: A price book's `validTo` is in the past but `isActive = true`
> The backend date-validity filter ignores expired books (i.e., current date > `validTo`). They are treated as **unavailable** regardless of the `isActive` flag.

---

## 7. Full Real-World Product Walkthrough

> **Scenario**: Your store sells "Sports Polo Shirts". You have 4 customer types: guests, VIP club members, registered B2B resellers, and corporate contract accounts.

### Step 1 — Create Price Books
| Book Name | Code | Type | Currency | Valid From | Valid To |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Standard Retail | `RETAIL-BDT` | RETAIL | BDT | — | — |
| Eid Holiday Sale | `EID-2026` | PROMOTIONAL | BDT | 2026-05-20 | 2026-05-27 |
| Bulk Reseller | `WHOLESALE` | WHOLESALE | BDT | — | — |
| VIP Gold Members | `VIP-GOLD` | CUSTOMER_SPECIFIC | BDT | — | — |

### Step 2 — Add Tier Rows to Each Price Book (via Product Edit → Volume Pricing)
| Price Book | Min Qty | Price (BDT) |
| :--- | :--- | :--- |
| RETAIL-BDT | 1 | 500 |
| RETAIL-BDT | 10 | 475 |
| EID-2026 | 1 | 400 |
| EID-2026 | 10 | 380 |
| WHOLESALE | 25 | 350 |
| WHOLESALE | 100 | 300 |
| VIP-GOLD | 1 | 430 |
| VIP-GOLD | 5 | 410 |

### Step 3 — Assign VIP Gold book to specific customers
In the Admin CRM portal → Customer Edit page, set `priceBookCode = 'VIP-GOLD'` on the customer profile of loyalty club members.

### Step 4 — Assign WHOLESALE book to B2B accounts
In the Admin CRM portal → Customer Edit page, set `priceBookCode = 'WHOLESALE'` on each B2B partner account. OR implement a server-side threshold check (if `totalQty >= 25` AND `user.role === 'WHOLESALE'`, pass `priceBookCode: 'WHOLESALE'`).

### Step 5 — What each customer sees
| Customer | Date | Qty | Price (BDT) |
| :--- | :--- | :--- | :--- |
| Guest | Normal | 1 | **500** (RETAIL) |
| Guest | Eid week | 1 | **400** (PROMOTIONAL auto) |
| Guest | Eid week | 12 | **380** (PROMOTIONAL bulk tier) |
| VIP Gold member | Any day | 1 | **430** (VIP-GOLD) |
| VIP Gold member | Any day | 5 | **410** (VIP-GOLD tier) |
| Wholesale reseller | Any day | 25 | **350** (WHOLESALE) |
| Wholesale reseller | Any day | 100 | **300** (WHOLESALE bulk) |
| Contract client | Any day | 1 | → manually set per order |

---

## 8. Implementation Roadmap for Advanced Mapping (Future Backlog & Completed Tasks)

### Completed Implementations ✅
- **Customer-Specific Price Book Field**: Added `priceBookCode` to `UserEntity` database table and fully wired up user-creation and update DTOs.
- **Admin Portal CRM Integration**: Added a premium **"Assigned Price Book"** select dropdown inside the Customer Edit B2B tab, enabling easy assignment of price books (`RETAIL`, `PROMOTIONAL`, `WHOLESALE`, `CUSTOMER_SPECIFIC`) to individual customer accounts.
- **Storefront Cart Real-time Resolution**: Integrated `PricingService` inside `CartService` so wholesale and VIP customers instantly see their custom catalog prices applied directly in their active storefront cart.
- **Order Checkout Flow Integration**: Integrated user-level and order-level price book resolution during order processing in `OrderService` (Explicitly provided code > Customer's assigned book > Promotional campaign fallback > Retail fallback).

### Future Backlog 🚀
The following features are the natural next steps for full-coverage price book assignment automation:

| Feature | Priority | Details |
| :--- | :--- | :--- |
| Customer segment → Price Book mapping table | 🔴 High | Links CRM audience groups or loyalty tiers to books. Resolves dynamically based on group membership. |
| Quantity-threshold WHOLESALE auto-trigger | 🟡 Medium | Cart middleware checks if `totalQty` exceeds a merchant-configured threshold, then injects `WHOLESALE` code. |
| Price Book selector dropdown in Order creation UI | 🟡 Medium | Allows sales reps creating manual back-office orders to explicitly pick the appropriate book. |
| Price Book assignment audit log | 🟢 Low | Tracks when a book was manually assigned or auto-resolved per session for compliance reporting. |
| Price Book expiry notifications | 🟢 Low | Sends an alert when a `PROMOTIONAL` or `CUSTOMER_SPECIFIC` book is nearing its `validTo` expiry. |
