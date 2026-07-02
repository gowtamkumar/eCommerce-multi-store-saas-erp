# Codebase Understanding — Catalog, Content & Marketing Modules

This document provides a detailed breakdown of the codebase implementation for the Catalog, Content, Marketing, and settings modules of the Enterprise Multi-Store SaaS ERP.

---

## 1. Catalog Domain

Located at: `server/src/modules/admin/catalog/`.

### 1.1 Database Entities
*   **`ProductEntity` (`product/entities/product.entity.ts`):**
    The product master record. Stores `sku`, `name`, `barcode`, `description`, `lowStockThreshold`, and status fields. Scoped by `storeId`.
*   **`ProductVariantEntity` (`product/entities/variant.entity.ts`):**
    Stores options (e.g. Size, Color) of a product. Holds standard fields like `purchasePrice`, `retailPrice`, and relationships to stock tracking.
*   **`ProductAttributeEntity` (`product/entities/attribute.entity.ts`):**
    Defines configurable properties (keys and values) attached to catalog products.
*   **`CategoryEntity` (`category/entities/category.entity.ts`):**
    Nested hierarchical categories (parent-child nodes) for organizing the storefront layout.
*   **`BrandEntity` (`brand/entities/brand.entity.ts`):**
    Product brand metadata (e.g., logo, description).

### 1.2 Services & Controllers
*   **`ProductService` (`product/services/product.service.ts`):**
    Handles product creation, bulk attribute tagging, batch price modifications, and variant registration.
*   **`ProductPricingService` (`pricing/`):**
    Resolves variant prices across multiple active price books, taking discount structures and bulk purchase rules into account.

### 1.3 Key API Endpoints
*   `POST /api/admin/catalog/products` — Create a product master along with its nested variants.
*   `GET /api/admin/catalog/categories` — Fetch the full category tree structure.

---

## 2. Content & Page Builder Domain

Located at: `server/src/modules/admin/content/`.

### 2.1 Code Structure
*   **`PageModule` (`page/`):**
    Implements database tables for custom content pages (e.g. Terms, About Us). The page content stores a JSON representation of grid blocks for the page builder engine.
*   **`FaqModule` (`faq/`):**
    Simple FAQ CRUD endpoints mapped to public storefront sections.

---

## 3. Marketing & Customer Loyalty Domain

Located at: `server/src/modules/admin/marketing/`.

### 3.1 Code Structure
*   **`CampaignModule` (`campaign/`):**
    Manages promotional discounts, rules-based coupons (Strategy Pattern integration), and marketing newsletters.
*   **`LoyaltyModule` (`loyalty/`):**
    Defines loyalty point rules (e.g. points earned per dollar spent) and handles customer point redemptions.

---

## 4. Platform Settings Domain

Located at: `server/src/modules/admin/settings/`.

### 4.1 Database Entities
*   **`SiteSettingsEntity` (`entities/site-settings.entity.ts`):**
    Stores store-level configuration parameters. Keys include `storeName`, `contactEmail`, `defaultCurrency`, `removeBranding` (boolean flag to suppress "Powered by" footer on basic/premium plans), and custom theme layouts.

### 4.2 Services & Controllers
*   **`SettingsService` (`settings.service.ts`):**
    Updates configuration variables and invalidates the cached settings in Redis.
