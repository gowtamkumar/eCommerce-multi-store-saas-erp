# API Caching Strategy

This document outlines the strategy for implementing caching in the eCommerce Multi-Tenant SaaS application. The goal is to improve performance and reduce database load for high-traffic, read-heavy endpoints.

## Recommended Caching Strategy

We recommend using **Redis** (or an in-memory cache for smaller scale) to cache responses for the following public-facing, read-heavy APIs.

### High Priority Endpoints (Public & Static Content)

These endpoints are critical for the initial page load and browsing experience. They change infrequently and are accessed by all users.

| Priority | Controller | Method | Endpoint | TTL (Time-To-Live) | Rational |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P0** | **Home** | `getHomeData` | `GET /home` | **5-10 mins** | Aggregates heavy data for the landing page. High traffic. |
| **P0** | **Settings** | `getSettings` | `GET /settings` | **1 hour** | Global site settings (logo, colors) rarely change. |
| **P0** | **Tenant** | `findByDomain` | `GET /tenant` | **1 hour** | Tenant config resolution is the first step for every request. |
| **P0** | **Plans** | `findAll` | `GET /plans` | **1 hour** | Subscription plans are static. |
| **P0** | **Category** | `findAll` | `GET /categories` | **1 hour** | Category trees are static and read often. |
| **P1** | **Product** | `findLatest` | `GET /products/latest` | **5 mins** | Homepage product showcase. |
| **P1** | **Product** | `findAll` | `GET /products` | **5 mins** | Main product listing. Heavy database query with filters. |
| **P1** | **Product** | `findBySlug` | `GET /products/slug/:slug` | **10 mins** | Product detail pages. |
| **P1** | **Page** | `findHomePage` | `GET /pages/home` | **30 mins** | CMS content for home. |
| **P1** | **FAQ** | `findAll` | `GET /faqs` | **1 hour** | Static help content. |

### Medium Priority (Dynamic but Cacheable)

| Priority | Controller | Method | Endpoint | TTL | Rational |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P2** | **Review** | `findByProduct` | `GET /products/:id/reviews` | **1-5 mins** | Reviews don't need real-time updates. |
| **P2** | **Page** | `findAll` | `GET /pages` | **30 mins** | List of CMS pages. |

---

## Excluded from Caching (Always Real-Time)

To prevent data leaks, inventory errors, or race conditions, the following categories are strictly excluded from API-level caching (enforced programmatically in `CacheService`):

*   **POS Checkout Tenders**: Cash drawer openings, shifts closing (Z-reports), and split cash/card balances.
*   **Customer Carts**: Shopping carts (`/cart`) and checkout calculations (`/checkout`).
*   **Real-time Stock Checks**: Available-to-promise (ATP) inventory levels checks during checkout.
*   **Auth Routes**: OTP delivery checks, verification email tokens.

## Implementation Guidelines

1.  **Cache Key Strategy**:
    *   Must include `TenantId` to prevent data leaking between tenants.
    *   Example: `cache:tenant:{tenantId}:products:latest`
2.  **Invalidation**:
    *   Implement **automated cache invalidation** on `POST`, `PUT`, `DELETE` events.
    *   *Example*: When a Product is updated (`PUT /products/:id`), clear specific product cache keys or the whole product list cache for that tenant.
3.  **Technology**:
    *   Use NestJS `CacheModule` with **Redis Store**.
    *   Decorate controllers with `@UseInterceptors(CacheInterceptor)` and `@CacheTTL()`.

## Next Steps

1.  Configure Redis in `app.module.ts`.
2.  Apply `CacheInterceptor` to the identified P0 endpoints first.
3.  Test performance improvements.
