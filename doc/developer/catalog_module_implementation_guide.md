# ERP Catalog Module — Deep Implementation Guide

> **Document Purpose:** This guide defines the architecture, data model, business rules, and UI design for a production-grade ERP Catalog Module. It is the single source of truth for all product and catalog development decisions.
> 
> **Context:** This system supports Multi-Store SaaS with both Retail (B2C) and Wholesale (B2B) business models, backed by an Immutable Inventory Ledger Engine.

---

## 1. What Is the ERP Catalog Module?

In a traditional eCommerce system, the "product" is simply a listing with a price and a stock number. In an ERP, the product is a **financial asset**. It is the intersection of:

- **Supply Chain** → Where does it come from? Who supplies it? What did we pay?
- **Inventory** → How many units do we physically have, per location?
- **Finance** → What is its true cost? What is our margin? What is its book value?
- **Sales** → What price do we charge for B2C retail? What price do we charge for B2B wholesale?
- **Marketing** → How is it presented? What category? What brand?

The Catalog Module is responsible for **defining the asset**. It does not create stock. It does not record transactions. It is the master reference that all other modules (Procurement, Sales, POS, Warehouse) link back to.

---

## 2. Core Entities & Their Responsibilities

The catalog is not just one entity. It is a hierarchy of interrelated entities.

```
Category (Tree)
  └── Brand
  └── Supplier (Default)
      └── Product (Base Unit of Trade)
            ├── ProductAttribute (Option Definitions, e.g., "Color", "Size")
            ├── ProductVariant (The sellable SKU, e.g., "Red / XL")
            │     └── InventoryLedger (Stock movements per Variant)
            ├── ProductMedia (Images, Videos)
            ├── ProductFAQ (Content)
            └── ProductPricing (Retail + Wholesale pricing tiers)
```

---

## 3. Entity Deep-Dive

### 3.1 Category Entity

The category is a **hierarchical tree** (parent-child). Each category can have sub-categories.

**Required Fields:**
| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | string | Display name |
| `slug` | string (unique) | URL path |
| `parentId` | UUID (nullable) | Self-referencing tree |
| `image` | string | Category banner/icon |
| `description` | text | SEO content |
| `isActive` | boolean | Soft disable |
| `sortOrder` | int | Manual ordering |
| `storeId` | UUID | Multi-store isolation |

**Business Rules:**
- A category can have unlimited levels of depth.
- Deleting a parent must NOT hard-delete — must reassign children or soft-delete.
- A product must always belong to exactly one leaf-level category.

---

### 3.2 Brand Entity

Brands help customers filter and build trust. They are also important for procurement (you might buy "Nike" from multiple suppliers).

**Required Fields:**
| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | string | Brand name |
| `slug` | string (unique) | URL path |
| `logo` | string | Image URL |
| `description` | text | About the brand |
| `website` | string | External URL |
| `isActive` | boolean | Soft disable |
| `storeId` | UUID | Multi-store isolation |

---

### 3.3 Product Entity (The Master Record)

This is the central entity. It represents a **product line**, not an individual physical item.

**Required Fields:**
| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | string | Full product name |
| `slug` | string (unique) | URL identifier |
| `sku` | string | Base SKU (for simple products) |
| `barcode` | string | EAN/UPC/QR code |
| `description` | text | Full rich-text description |
| `shortDescription` | text | Marketing summary |
| `categoryId` | UUID | Which category |
| `brandId` | UUID | Which brand |
| `supplierId` | UUID | Default supplier |
| `status` | enum | `ACTIVE`, `INACTIVE`, `DRAFT`, `DISCONTINUED` |
| `productType` | enum | `SIMPLE`, `VARIABLE`, `BUNDLE`, `SERVICE` |

**Retail (B2C) Pricing Fields:**
| Field | Type | Purpose |
|---|---|---|
| `price` | decimal(10,2) | Base retail selling price |
| `discountAmount` | decimal(10,2) | Discount value |
| `discountType` | enum | `PERCENTAGE` or `FIXED` |
| `taxRate` | decimal(5,2) | Tax percentage (e.g., 15%) |

**Wholesale (B2B) Pricing Fields:**
| Field | Type | Purpose |
|---|---|---|
| `wholesalePrice` | decimal(10,2) | B2B unit price |
| `minWholesaleQty` | int | Minimum order to unlock B2B price |

**Cost Intelligence Fields (Auto-Calculated — READ ONLY):**
| Field | Type | Purpose |
|---|---|---|
| `averageCost` | decimal(10,2) | Moving average procurement cost |
| `retailMargin` | virtual | `(price - averageCost) / price * 100` |
| `wholesaleMargin` | virtual | `(wholesalePrice - averageCost) / wholesalePrice * 100` |

**Inventory Aggregate Fields (Cached — READ ONLY):**
| Field | Type | Purpose |
|---|---|---|
| `stock` | int | Cached total stock (from Ledger) |
| `reservedStock` | int | Qty reserved for pending orders |
| `lowStockThreshold` | int | Alert trigger level |

**Content & SEO Fields:**
| Field | Type | Purpose |
|---|---|---|
| `images` | string[] | Ordered image URLs |
| `metaTitle` | string | SEO title tag |
| `metaDescription` | text | SEO description |
| `ogImage` | string | Social share image |
| `isNew` | boolean | "New Arrival" badge |
| `isHot` | boolean | "Trending" badge |
| `isSale` | boolean | "On Sale" badge |

---

### 3.4 Product Variant Entity (The Sellable SKU)

When a product has options (e.g., Color, Size), each combination becomes a **Variant**. This is the entity that gets purchased, shipped, and sold. The Ledger tracks stock at the **Variant level**.

**Required Fields:**
| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary Key |
| `productId` | UUID | Parent product |
| `sku` | string (unique per store) | The actual sellable code |
| `barcode` | string | EAN/UPC for this variant |
| `combination` | jsonb | `{ "Color": "Red", "Size": "XL" }` |
| `isDefault` | boolean | Which variant is shown by default |

**Retail (B2C) Price Override:**
| Field | Type | Purpose |
|---|---|---|
| `price` | decimal(10,2) | Overrides parent product retail price |

**Wholesale (B2B) Price Override:**
| Field | Type | Purpose |
|---|---|---|
| `wholesalePrice` | decimal(10,2) | Overrides parent product B2B price |

**Cost Intelligence (Auto-Calculated — READ ONLY):**
| Field | Type | Purpose |
|---|---|---|
| `averageCost` | decimal(10,2) | Moving average cost per variant |

**Inventory Aggregate (Cached — READ ONLY):**
| Field | Type | Purpose |
|---|---|---|
| `stock` | int | Cached stock for this variant |
| `reservedStock` | int | Reserved stock |
| `lowStockThreshold` | int | Alert level |

**Media:**
| Field | Type | Purpose |
|---|---|---|
| `images` | string[] | Variant-specific images (e.g., "Red" color photo) |

**Business Rules:**
- A variant's `sku` must be globally unique within a store.
- `stock` must NEVER be set by the product form. It is exclusively controlled by the Inventory Ledger.
- `averageCost` must NEVER be editable by users. It is calculated automatically by the Ledger Engine on each `PURCHASE` transaction.

---

### 3.5 Product Attribute Entity

Attributes define the option schema (e.g., "Color" with values "Red, Blue, Green").

**Required Fields:**
| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary Key |
| `productId` | UUID | Parent product |
| `name` | string | e.g., "Color", "Size" |
| `values` | string[] | e.g., `["Red", "Blue", "XL"]` |

---

## 4. Product Type Strategy

The `productType` field determines the entire behavior of the product in the system:

| Type | Description | Has Variants? | Has Stock? | Example |
|---|---|---|---|---|
| `SIMPLE` | Single SKU, no options | No | Yes (Ledger) | "Blue Pen" |
| `VARIABLE` | Multiple combinations | Yes | Yes (per Variant, via Ledger) | "T-Shirt (S/M/L in Red/Blue)" |
| `BUNDLE` | A kit of other products | Virtual | Derived from components | "Office Starter Pack" |
| `SERVICE` | Non-physical | No | No | "Installation Fee" |

---

## 5. Pricing Architecture (Retail vs Wholesale)

This is the most critical business logic in the catalog.

### 5.1 Retail Pricing (B2C)

The price a walk-in customer or online shopper pays.

```
Retail Final Price = (Base Price - Discount) + Tax
```

- **Base Price**: The `product.price` or `variant.price` (if overridden).
- **Discount**: Applied as a percentage or fixed amount.
- **Tax**: Applied as a percentage on top of the discounted price.

### 5.2 Wholesale Pricing (B2B)

The price a registered business partner pays when ordering in bulk.

```
Wholesale Activation Condition: Order Quantity >= minWholesaleQty
Wholesale Price: product.wholesalePrice or variant.wholesalePrice (if overridden)
```

- The `minWholesaleQty` is the "gate". If an order contains fewer units than this threshold, retail price applies.
- Wholesale pricing is typically **pre-tax** (businesses handle their own tax reclaim).

### 5.3 Margin Intelligence

Both pricing tiers must be compared against the `averageCost` to show profitability in real time.

```
Retail Gross Margin   = ((Retail Price - Average Cost) / Retail Price) × 100
Wholesale Gross Margin = ((Wholesale Price - Average Cost) / Wholesale Price) × 100
```

**Health Thresholds (Suggested):**
- `>= 40%` → Green ✅ Healthy margin
- `20% – 39%` → Amber ⚠️ Low margin, review recommended
- `< 20%` → Red 🔴 Selling at near-cost or loss

---

## 6. Inventory Policy (Strict Ledger Rule)

> **CRITICAL RULE: Stock is never manually entered through the catalog.**

### The Zero-Stock Initialization Rule
Every new product and variant starts with `stock = 0`. This is enforced at the API level and in the database default.

### How Stock Enters the System
Stock is created exclusively through the **Procurement Module**:
1. Admin creates a **Purchase Order (PO)** linked to a Supplier.
2. Admin adds catalog products/variants with quantities and unit costs.
3. When goods arrive, a **Goods Received Note (GRN)** is processed.
4. The GRN triggers the **Inventory Ledger Engine**, which:
   - Writes an immutable `PURCHASE` transaction record.
   - Increments the cached `stock` counter on the product/variant.
   - Recalculates the `averageCost` using the Moving Average formula.

### How Stock Leaves the System
- **Sales Order / POS** → Creates `SALE` ledger entry, decrements stock.
- **Stock Adjustment** → Creates `ADJUSTMENT` entry (must have a reason/note).
- **Damage Write-Off** → Creates `DAMAGE` entry.
- **Stock Transfer** → Creates paired `TRANSFER_OUT` / `TRANSFER_IN` entries.

### The Audit Trail (Inventory Ledger)
Every stock movement generates an immutable ledger row:

| Field | Purpose |
|---|---|
| `type` | `PURCHASE`, `SALE`, `RETURN`, `ADJUSTMENT`, `DAMAGE`, `TRANSFER_IN/OUT` |
| `quantity` | Change amount (positive or negative) |
| `balanceAfter` | Running balance after this transaction |
| `unitCost` | Cost per unit at time of transaction (for PURCHASE) |
| `referenceNumber` | Links to the GRN, SO, or Adjustment document |
| `warehouseId` | Which physical location |
| `userId` | Who processed it |
| `createdAt` | Immutable timestamp |

---

## 7. UI Design Guidelines

### 7.1 Product List Page (`/admin/products`)

**Purpose:** Overview and navigation hub.

**Must Show:**
- Product image thumbnail
- Product name and SKU
- Category and Brand tags
- Stock level badge (color-coded: Green/Amber/Red)
- Retail Price and Wholesale Price (both visible)
- Gross Margin % (Retail)
- Status badge (`ACTIVE`, `DRAFT`, etc.)

**Actions:**
- Create New Product button (top right)
- Quick filters: Status, Category, Brand, Low Stock
- Search by name, SKU, barcode
- Bulk actions: Activate, Deactivate, Export

---

### 7.2 Product Create/Edit Form (`/admin/products/new` & `/admin/products/[id]`)

The form is split into a **2-column layout** with a main content area and a right sidebar.

#### Main Content Column (Left)

**Section 1: General Information**
- Product Name (required)
- Slug (auto-generated, editable)
- Short Description (plain text, 160 chars)
- Full Description (rich text editor)

**Section 2: Inventory & Variants**
- Product Type selector: Simple / Variable
- If `Simple`: Shows one Stock (Read-Only) field
- If `Variable`: Shows the Attribute Builder and Variant Matrix (see below)

**Section 3: Inventory Ledger Audit Trail** *(Edit mode only)*
- Read-only table of all historical stock movements
- "Restock via Procurement" button → links to PO creation

**Section 4: SEO & Meta**
- Meta Title, Meta Description, OG Image

**Section 5: FAQs**
- Manual FAQ editor or selection from FAQ library

#### Sidebar Column (Right)

**Card 1: Details**
- Status (Active / Inactive / Draft / Discontinued)
- Category picker
- Brand picker
- Supplier picker (default supplier for procurement)
- Badges (isNew, isHot, isSale)

**Card 2: Pricing Engine** ← Most important card
- **Retail (B2C) Section** (green indicator)
  - Retail Base Price (editable)
  - Retail Gross Margin % (auto-calculated, read-only)
  - Discount Type + Discount Value
  - Retail Price Breakdown (if discount/tax applied)
- **Wholesale (B2B) Section** (indigo indicator)
  - Wholesale Unit Price (editable)
  - Minimum Order Quantity/MOQ (editable)
  - Wholesale Gross Margin % (auto-calculated, read-only)
- **Tax & Inventory Section**
  - Moving Average Cost (auto-calculated, read-only)
  - Tax Rate (%)
  - Current Stock (read-only)
  - Low Stock Alert Threshold (editable)

**Card 3: Product Media**
- Image upload/URL input
- Ordered image gallery

---

### 7.3 Variant Matrix (for Variable Products)

When a product is "Variable", the user defines the options using the **Attribute Builder**, then clicks "Generate Variants".

#### Attribute Builder
```
Option: Color    | Values: Red, Blue, Green
Option: Size     | Values: S, M, L, XL
```

#### Generated Variant Matrix (per row)

Each row in the variant table must show:
| Field | Editable? |
|---|---|
| ★ (Default star) | Yes - click to set default |
| Combination label (e.g., "Red / XL") | No (auto) |
| SKU | Yes (required, auto-suggested) |
| Barcode | Yes (optional) |
| Retail Price Override | Yes (leave blank = inherit from product) |
| Wholesale Price Override | Yes (leave blank = inherit from product) |
| Stock | NO — Read-Only |
| Low Stock Threshold | Yes |
| Images (variant-specific) | Yes |
| Delete button | Yes |

---

## 8. Data Integrity & Validation Rules

| Rule | Where Enforced |
|---|---|
| SKU must be unique per store | Database unique index + API validation |
| `stock` cannot be set via Product API | API strips the field before save |
| `averageCost` cannot be set via Product API | API strips the field before save |
| `wholesalePrice` cannot exceed `retailPrice` | API + frontend validation |
| `minWholesaleQty` must be >= 1 | API validation |
| Deleting a product with stock > 0 is blocked | API blocks, shows error |
| Category must exist before assigning | Foreign key constraint |
| Variants must have unique SKU within store | DB unique index on (sku, storeId) |

---

## 9. API Design (Endpoint Reference)

### Category APIs
| Method | Path | Purpose |
|---|---|---|
| GET | `/categories` | List all categories (tree) |
| GET | `/categories/:id` | Get single category |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Soft delete |

### Brand APIs
| Method | Path | Purpose |
|---|---|---|
| GET | `/brands` | List all brands |
| POST | `/brands` | Create brand |
| PATCH | `/brands/:id` | Update brand |
| DELETE | `/brands/:id` | Soft delete |

### Product APIs
| Method | Path | Purpose |
|---|---|---|
| GET | `/products` | List products (paginated, filterable) |
| GET | `/products/:id` | Get product with variants |
| POST | `/products` | Create product (stock forced to 0) |
| PATCH | `/products/:id` | Update product (stock/averageCost stripped) |
| DELETE | `/products/:id` | Soft delete (blocked if stock > 0) |
| GET | `/products/:id/ledger` | Get inventory audit trail |

### Query Parameters for Product List:
- `?status=active` — Filter by status
- `?categoryId=uuid` — Filter by category
- `?brandId=uuid` — Filter by brand
- `?search=nike` — Search by name/SKU/barcode
- `?lowStock=true` — Filter products below threshold
- `?limit=20&page=1` — Pagination

---

## 10. Integration Points With Other Modules

| Module | Integration |
|---|---|
| **Procurement** | PO line items reference `productId` and `variantId` to pick catalog items. GRN triggers Ledger update and averageCost recalculation. |
| **POS / Sales** | Sales order and POS terminal fetch product retail price, check stock availability, and trigger `SALE` ledger entries on checkout. |
| **Warehouse** | Inventory Ledger scoped to `warehouseId`. Transfer orders create `TRANSFER_OUT` / `TRANSFER_IN` entries. |
| **Finance / Accounting** | `averageCost` feeds into COGS calculation. Product stock × averageCost = Inventory asset on Balance Sheet. |
| **Promotions** | Campaigns reference `productId` or `categoryId` to apply discount rules on top of base retail price. |
| **Reports** | Catalog module exposes margin analytics: best-selling by margin, low-margin products, dead stock (zero sales in N days). |

---

## 11. Implementation Priority Roadmap

### Phase 1 — Foundation (Must Do First)
- [x] Category CRUD with tree support
- [x] Brand CRUD
- [x] Simple Product CRUD (name, price, images, stock=0)
- [x] Variable Product with Attribute + Variant generation
- [x] Zero-stock enforcement at API level

### Phase 2 — Procurement Integration (Current Focus)
- [x] `averageCost` column on Product + Variant
- [x] Inventory Ledger service recalculates `averageCost` on GRN
- [x] Ledger audit trail tab in Product Edit UI
- [x] Retail Gross Margin real-time calculator in UI
- [x] Wholesale Price + MOQ fields on Product + Variant
- [x] Wholesale Gross Margin real-time calculator in UI

### Phase 3 — Advanced Catalog (Next Steps)
- [ ] Barcode/QR code field on Product + Variant
- [ ] Product Type: `BUNDLE` (kit of other products)
- [ ] Product Type: `SERVICE` (non-inventory)
- [ ] Supplier-specific pricing (same product, different price per supplier)
- [ ] Multi-warehouse stock aggregation (total stock = sum of all warehouse stocks)
- [ ] Price tiers (e.g., buy 1-9 = $50, buy 10-49 = $45, buy 50+ = $40)
- [ ] Product import/export (CSV/Excel)
- [ ] Batch/Expiry date tracking per Variant

### Phase 4 — Intelligence & Analytics
- [ ] Dead stock alerts (no sales in 60/90 days)
- [ ] Reorder point automation (trigger PO when stock <= threshold)
- [ ] Margin analysis report (sort all products by gross margin)
- [ ] Inventory valuation report (total asset value = sum of stock × averageCost)
- [ ] Top products by revenue / by margin
- [ ] Supplier performance tracking (lead times, quality issues)

---

## 12. Key Design Decisions & Rationale

### Why is stock Read-Only in the Catalog form?
Because stock is a **financial quantity**. Allowing a user to type "100" into a box creates inventory from nothing, with no audit trail, no supplier reference, and no cost record. This breaks the entire accounting model. Every unit in your warehouse must be traceable to a purchase document.

### Why do we track averageCost at the Variant level?
Because different variants of the same product may have been purchased at different times and at different prices. A Size XL T-shirt might cost $8 while a Size S costs $7 because they came from different production runs. Without variant-level costing, your margins are inaccurate.

### Why Moving Average Cost instead of FIFO?
Moving Average is simpler to implement, easier for business owners to understand, and works well for most retail and wholesale scenarios. FIFO is more accurate for perishable goods and is required in some jurisdictions. The Ledger Engine can be upgraded to FIFO in Phase 4 without changing the entity structure.

### Why both Retail and Wholesale prices on the same Product?
Because many businesses sell to both individuals and to other businesses from the same inventory pool. Maintaining two price tiers per product (with an MOQ gate) eliminates the need for maintaining two separate product catalogs for the same physical item.
