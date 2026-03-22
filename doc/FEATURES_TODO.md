# eCommerce Implementation Checklist: Missing Features

This file tracks the implementation of recommended features to complete the multi-tenant SaaS eCommerce platform.

## 1. Automated Communications (Notifications)
- [ ] **MailService Implementation**: Create a centralized service using NestJS `@nestjs-modules/mailer` or similar.
- [ ] **Order Confirmation Emails**: Send to customers immediately after successful `createOrder`.
- [ ] **Shipping Update Emails**: Trigger when order status changes to `SHIPPED` or `OUT_FOR_DELIVERY`.
- [ ] **Low Stock Admin Alerts**: Check stock levels during `createOrder` and notify admin if it drops below `lowStockThreshold`.
- [ ] **Password Reset Workflow**: Fully automated secure link generation and emailing.

## 2. Marketing & Conversion
- [ ] **Wishlist Module**:
    - [ ] Backend: `WishlistEntity` (Many-to-Many between User and Product).
    - [ ] Frontend: "Add to Wishlist" button and a saved items page.
- [ ] **Abandoned Cart Recovery**:
    - [ ] Background job (e.g., using `@nestjs/schedule`) to find carts inactive for > 1 hour.
    - [ ] Automated email reminder for logged-in users.
- [ ] **Dynamic Product Badges**:
    - [ ] Admin: Checkboxes for "New", "Hot", "Sale" in Product management.
    - [ ] Frontend: Visual badges on product cards.
- [ ] **Related Products**:
    - [ ] Simple implementation: Show products from the same category.
    - [ ] Advanced: Manual cross-sell links in admin.

## 3. SEO & Discovery
- [ ] **Dynamic Sitemap**: Endpoint `/sitemap.xml` that pulls all active category and product slugs.
- [ ] **Robots.txt Editor**: Add a text field in `SiteSettings` (Admin Console) to manage `robots.txt` content.
- [ ] **Autocomplete Search**: Enhance the search bar with real-time suggestions from the backend.
- [ ] **Faceted Filters**: Allow filtering by Price Range, Brand, and specific Attributes (Size, Color).

## 4. User Experience (UX)
- [ ] **Social Login**: Integrate `Passport-Google-OAuth20` or similar for Google/Facebook login.
- [ ] **Guest Checkout**: Ensure the UI handles checkout without forcing account creation (backend already supports this).
- [ ] **Recently Viewed Products**: Use browser `localStorage` or session-based backend tracking to show history.
- [ ] **Live Chat Widget**: Add a setting in Admin for "Chat Script/ID" to embed WhatsApp/Messenger widgets.

## 5. Operations
- [x] PDF Invoice Generation <!-- id: 7 -->
Integrate `jspdf` or `pdfkit` to generate invoices on-the-fly.
- [ ] **Data Export**: Buttons in Admin tables (Orders, Customers) to export current view to CSV/Excel.
- [ ] **Enhanced RBAC**: Define system roles (Store Manager, Support, Marketing) with restricted access to modules.

## 6. Globalization
- [ ] **Multi-language Support (i18n)**:
    - [ ] Backend: Support for translated strings in Product/Category entities.
    - [ ] Frontend: `next-intl` or similar for UI language switching.

## 7. POS (Point of Sale) Enhancements
- [ ] **Barcode Scanning Integration**: Optimize the search field to auto-add products on exact SKU match from a scanner.
- [ ] **Advanced Hardware Support**: Integrate ESC/POS for direct thermal receipt printing (beyond standard `window.print`).
- [ ] **Shift & Cash Management**: Track cash drawer sessions (Opening/Closing balance) for accountability.
- [ ] **Cart Hold/Resume**: Allow "parking" a transaction to serve another customer and resuming it later.
- [ ] **Keyboard Shortcuts**: Add fast navigation keys for experienced cashiers (e.g., F2 for search, F9 for checkout).
- [ ] **Customer Credit/Wallet**: Allow regular customers to purchase on credit to be settled later.
