# 🏷️ Subscription Plan Tiers

This document outlines the proposed 3-tier subscription model (**Free**, **Standard**, **Pro**) for the Multi-Tenant eCommerce SaaS platform, mapped directly to the available administrative routes.

---

## 🟢 1. Free Plan
*Goal: Provide essential features for a new merchant to set up a basic store, add products, and receive their first orders.*

### Included Modules & Routes:
- **Insights:** Dashboard (`/admin`)
- **Catalog:** Products (`/admin/products`), Categories (`/admin/categories`), Media (`/admin/media`)
- **Sales & CRM:** Orders (`/admin/orders`), Customers (`/admin/customers`)
- **Operations:** Inventory (`/admin/inventory`)
- **User Account:** My Profile (`/admin/profile`)
- **System Settings:** General Info (`tab=general`), Social Links (`tab=social`)
- **Storefront & UI:** FAQs (`/admin/faqs`)

### Example Feature Limits:
- Maximum 50 Products
- 1 Admin User (No extra Staff Accounts)
- Standard Cash on Delivery only (No digital payment gateway integrations)
- Community/Ticket Support

---

## 🔵 2. Standard Plan
*Goal: For growing businesses that need proper branding, customer engagement, marketing tools, and digital payments.*

### Included Modules & Routes *(Everything in Free, plus)*:
- **Catalog:** Brands (`/admin/brands`), Reviews (`/admin/reviews`)
- **Sales & CRM:** Active Carts (`/admin/carts`), Payments (`/admin/payments`), Invoices (`/admin/invoices`)
- **Operations:** Couriers (`/admin/couriers`)
- **Marketing:** Coupons (`/admin/coupons`), Promotions (`/admin/promotions`)
- **Reports:** Sales Analysis (`/admin/reports/sales`), Finance Summary (`/admin/reports/finance`)
- **System Settings:** Custom Domain (`tab=domain`), Payment Methods (`tab=payment`), Courier Rules (`tab=courier`), Label Configuration (`tab=label`)
- **Storefront & UI:** Pages Builder (`/admin/pages`), Navbar Menu (`tab=navbar`), Footer Menu (`tab=footer`)

### Example Feature Limits:
- Maximum 1,000 Products
- 3 Staff Accounts
- Custom Domain Support & SSLCommerz Integration
- Priority Email Support

---

## 🟣 3. Pro Plan
*Goal: For established businesses that require full control over their operations, finances, advanced marketing, and granular UI customization.*

### Included Modules & Routes *(Everything in Standard, plus)*:
- **Sales & CRM:** Returns Management (`/admin/returns`)
- **Operations:** Suppliers (`/admin/suppliers`), Purchase Orders (`/admin/purchases`), Expenses (`/admin/expenses`)
- **Marketing:** Newsletter Leads (`/admin/leads`), Subscribers (`/admin/subscribers`), Messaging Campaigns (`/admin/campaigns`)
- **Reports:** Profit & Loss (`/admin/reports/profit-loss`), Supplier Ledger (`/admin/reports/supplier-ledger`), Customer Ledger (`/admin/reports/customer-ledger`), Cash Flow (`/admin/reports/cash-flow`), Export Center (`/admin/reports/export`)
- **Access Control:** Staff Accounts / Role Management (`/admin/team`)
- **System Settings:** Email Config (`tab=email`), SMS Configuration (`tab=sms`), Trust & Safety (`tab=trust`), SEO Settings (`tab=marketing`), Cache & Performance (`tab=system`)
- **Storefront & UI:** Product List UI (`tab=productsPage`), Product Detail UI (`tab=singleProductPage`), Offers Page UI (`tab=offersPage`)

### Example Feature Limits:
- Unlimited Products
- Unlimited Staff Accounts
- Advanced B2B/Operational tools (Purchase Orders, Expense tracking)
- Full SEO and SMS gateway access
- 24/7 Dedicated Support
