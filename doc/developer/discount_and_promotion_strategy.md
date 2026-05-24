# A-Z Discount & Promotion Strategy Guideline
## For Multi-Tenant eCommerce SaaS

This document provides a comprehensive blueprint for implementing and scaling a robust discount and promotion engine. It balances immediate marketing needs with long-term architectural scalability, ensuring each tenant can maintain their own unique sales strategies.

---

## 1. Strategic Architecture
In a multi-tenant environment, the strategy resides in a **Rules-Based Engine** rather than hardcoded logic.

### A. Core Distinction
*   **Coupons (Manual)**: Customer enters a code at checkout. Validated against usage limits and expiry.
*   **Promotions (Automatic)**: Applied automatically based on cart conditions (e.g., "Buy 2 get 1 free").
*   **Direct Discounts (Product-Level)**: Strikethrough pricing (MSRP vs. Sales Price).

### B. Tenant Isolation
Every rule, coupon, and promotion **must** include a `tenant_id` foreign key. Pricing calculations must be scoped strictly to the current tenant context to prevent "leaking" discounts across stores.

---

## 2. Advanced Discount Taxonomy
Beyond simple percentages, implement these high-conversion types:

### Category 1: Value Based
*   **Percentage Off**: (e.g., 15% off). Best for store-wide sales.
*   **Fixed Amount**: (e.g., $10 off). Best for "invitation" or "referral" rewards.
*   **Tiered (Spend & Save)**:
    *   Spend $100 → $10 Off
    *   Spend $200 → $30 Off
    *   Spend $300 → $60 Off

### Category 2: Behavior Based
*   **Quantity Breaks**: 1 unit = $20, 5 units = $15 each.
*   **Free Shipping**: Removes shipping cost if cart exceeds $X.

### Category 3: Lifecycle Based
*   **First Order**: For new customers only.
*   **Abandoned Cart**: Triggered via email after a user leaves items in the cart for 4 hours.

---

## 3. The Implementation Roadmap (A-Z)

### Phase 1: Database Foundation
Extend the existing schema to support complex conditions.
*   **Conditions Table**: Store serialized rules (e.g., `{"type": "min_weight", "value": 5kg}`).
*   **Actions Table**: Store what happens (e.g., `{"type": "discount_item", "percent": 10}`).
*   **Usage Tracking**: Separate table to log every time a coupon is used, linked to `order_id` and `customer_id`.

### Phase 2: The Calculation Engine ("The Brain")
Do not calculate discounts in controllers. Create a `PricingEngineService`.
1.  **Input**: Cart Items + Customer Context + Applied Coupons.
2.  **Logic**:
    *   Identify all active Automatic Promotions for the tenant.
    *   Validate Applied Coupons.
    *   **Prioritize Rules**: Apply "Product Level" first, then "Cart Automatic", then "Manual Coupon".
3.  **Output**: A detailed breakdown object showing original price, total savings, and final price.

### Phase 3: Admin Management (Tenant Dashboard)
Give store owners a powerful UI to manage campaigns:
*   **Campaign Wizard**: A step-by-step UI to create "Flash Sales".
*   **Exclusions Toggle**: Easily exclude "On Sale" enlightened items from further coupon discounts.
*   **Usage Analytics**: Show "Revenue Generated" vs "Discount Weight".

### Phase 4: Customer Experience (Storefront)
*   **Visual Urgency**: Countdown timers for flash sales.
*   **Savings Feedback**: "You saved $15.00 on this order!" shown at checkout.
*   **Dynamic Labels**: "Buy 1 more to unlock Free Shipping" progress bars.

---

## 4. Multi-Tenant Edge Cases & Rules
### I. Stacking Logic
Define a "Strictly One" vs "Cumulative" policy per tenant.
*   **Global Rule**: Most tenants prefer "Coupons cannot be used on already discounted items."
*   **SaaS Setting**: Allow the tenant to choose their stacking policy in their Store Settings.

### II. Geographic Restrictions
Restrict coupons to specific regions or postal codes (useful for shipping-heavy promotions).

### III. Customer Segmentation
Link promotions to **Customer Groups** (e.g., `Wholesale`, `VIP`, `Staff`).

---

## 5. Performance Engineering
In a SaaS with millions of requests, calculating discounts on every page load is expensive.
*   **Cache Results**: Cache the "Calculated Price" for active promotions in Redis, keyed by `tenant_id:product_id`.
*   **Pre-computing**: Compute the "Final Display Price" and store it in a `search_index` (Elasticsearch/Typesense) to avoid heavy SQL JOINs.

---

## 6. Implementation Detail: The Strategy Pattern (Code Level)

The Strategy Pattern allows you to switch between different discount calculation algorithms at runtime without changing the code that uses them.

### A. The Core Interface
Define a standard interface that all discount types must follow.

```typescript
// server/src/common/strategies/discount/Discount-strategy-interface.ts

export interface DiscountStrategy {
  /**
   * Calculates the final price after discount.
   * @param baseAmount The original price or cart total.
   * @param value The discount value (e.g., 10 for 10% or $10).
   * @returns The discounted price.
   */
  calculate(baseAmount: number, value: number): number;
}
```

### B. Concrete Strategy Implementations
Each discount type gets its own class.

```typescript
// Percentage Off
export class PercentageDiscountStrategy implements DiscountStrategy {
  calculate(baseAmount: number, value: number): number {
    const discount = (baseAmount * value) / 100;
    return Math.max(0, baseAmount - discount);
  }
}

// Fixed Amount Off
export class FixedAmountDiscountStrategy implements DiscountStrategy {
  calculate(baseAmount: number, value: number): number {
    return Math.max(0, baseAmount - value);
  }
}
```

### C. The Strategy Factory
Use a factory to instantiate the correct strategy based on the database record.

```typescript
// server/src/common/strategies/discount/Discount-strategy.factory.ts

export class DiscountStrategyFactory {
  static getStrategy(type: string): DiscountStrategy {
    switch (type) {
      case 'percentage':
        return new PercentageDiscountStrategy();
      case 'fixed_amount':
        return new FixedAmountDiscountStrategy();
      case 'free_shipping':
        // Returns base amount as shipping is handled separately
        return (base) => base; 
      default:
        throw new Error(`Unknown discount type: ${type}`);
    }
  }
}
```

### D. Using the Strategy in a Service
This is how you apply it to an order.

```typescript
// server/src/modules/admin/sales/pricing/pricing.service.ts

@Injectable()
export class PricingService {
  calculateOrderTotal(originalTotal: number, discountType: string, discountValue: number): number {
    // 1. Get the strategy from the factory
    const strategy = DiscountStrategyFactory.getStrategy(discountType);

    // 2. Execute the calculation strategy
    const finalTotal = strategy.calculate(originalTotal, discountValue);

    return finalTotal;
  }
}
```

---

## 7. Developer's A-Z Implementation Steps

1.  **Define Enums**: Create a `PromotionType` enum ('percentage', 'fixed').
2.  **Create Strategy Classes**: Implement the `DiscountStrategy` interface for each enum value.
3.  **Update Database**: Ensure `promotions` table has a `promotionType` and `value` column.
4.  **Implement Factory**: Use the `DiscountStrategyFactory` to map enums to classes.
5.  **Refactor Checkout**: Replace inline `if/else` logic in `OrderService` with the `PricingService.calculateTotal()` call.
6.  **Unit Tests**: Write tests for each strategy class (e.g., Ensure fixed discount doesn't result in negative price).

---

## Summary Checklist
- [x] Tenant-ID scoped schema.
- [x] Centralized `PricingEngine` service using **Strategy Pattern**.
- [x] Support for Percentage, Fixed, and Free Shipping.
- [x] Expiry dates and usage limits per customer.
- [x] Stacking/Exclusion logic.
- [x] Admin Revenue impact dashboard.
