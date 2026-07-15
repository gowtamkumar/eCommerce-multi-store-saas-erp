# Mobile Application Feature List

**Platform:** eCommerce Multi-Store SaaS ERP  
**Scope:** Features recommended for mobile apps — **excluding dashboards and analytics**  
**Related:** [`MOBILE_APP_GUIDE.md`](MOBILE_APP_GUIDE.md) (technical blueprint), `native-app/` (Expo scaffolding)  
**API base:** `/api/v1` · Swagger: `/api/docs`  
**Last Updated:** July 13, 2026  

---

## 1. Overview

This project is a **modular-monolith, multi-store SaaS ERP**. Each tenant (store) gets an online storefront, admin ERP, and POS, with strict per-store data isolation.

**Recommended mobile strategy:** two apps (or one app with strict persona gating):

| App | Audience | Purpose |
| :--- | :--- | :--- |
| **Customer Shopping App** | Buyers | Browse, cart, checkout, orders, loyalty |
| **Merchant / Staff Ops App** | Cashiers, warehouse, HR, support | POS, fulfillment, inventory ops, punch, chat |

Dashboards, KPI boards, P&L / financial reports, and super-admin analytics are **out of scope** for mobile.

### Current status

| Client | Status |
| :--- | :--- |
| Next.js storefront + admin (`client/`) | Full web UI |
| NestJS API (`server/`) | Most mobile features API-ready |
| Expo app (`native-app/`) | Merchant scaffold only: tenant lookup → admin login → branch/warehouse scope |

---

## 2. Customer Shopping App

### 2.1 Auth & Account

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Register / Login | Email + password, OTP / email verify | Ready (`/auth/*`) |
| Forgot / Reset password | Reset flow via email | Ready |
| Session management | Refresh tokens, logout, active sessions | Ready |
| Profile | View / edit name, phone, avatar | Ready |
| Push opt-in | FCM device register / unregister | Ready (`/notifications/register`) |

### 2.2 Store & Catalog

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Store context | Resolve store by subdomain / `x-store-id` | Ready |
| Home / CMS pages | Store home, banners, static pages | Ready (`store/pages`) |
| Product browse | List, filters, search, categories, brands | Ready (`/products`) |
| Product detail | Variants, images, price, stock status | Ready |
| Reviews | Read + authenticated write | Ready |
| Offers / promotions | Active coupons & promo listings | Ready |
| Multi-currency | Switch currency from store settings | Ready |
| AI shopping assist | Semantic search, product Q&A, shopping assistant (read-only; no cart mutation) | Ready |

### 2.3 Cart & Checkout

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Cart | Add / update / remove / sync | Ready |
| Coupons | Apply / remove discount codes | Ready |
| Stock checks | ATP / out-of-stock before checkout | Ready |
| Address book | CRUD shipping addresses + set default | Ready (`/store/shipping-address`) |
| Checkout | Create order from cart | Ready |
| Payment | SSLCommerz (CARD / MOBILE_BANKING), COD, WALLET | Ready (`POST /payment/init`) |
| Order confirmation | Success / fail / cancel handling | Ready |

**Supported payment methods on orders:** CASH, CARD, MOBILE_BANKING, COD, WALLET (plus gateway via SSLCommerz).

### 2.4 Orders & After-sales

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| My orders | List + detail + status | Ready |
| Tracking | Courier status / tracking ID | Ready |
| Returns / exchanges | Request return, view my returns | Ready (`/store/returns`) |
| Wallet | Balance + history (store credit) | Ready (`/store/wallet/me`) |
| Loyalty | Points, tier, earn / redeem status | Ready (`/store/loyalty/me`) |

### 2.5 Engagement

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Wishlist | Toggle / list / clear | Ready |
| Live chat | Socket.IO visitor support chat | Ready |
| In-app notifications | Order updates, offers | Ready |
| Newsletter | Subscribe / unsubscribe | Ready |
| Contact / lead form | Contact store → lead capture | Ready |

---

## 3. Merchant / Staff Ops App (No Dashboard)

Ops-focused screens for store teams. Do **not** include analytics widgets or financial report boards.

### 3.1 Auth & Workspace

| Feature | Details | Status in `native-app/` |
| :--- | :--- | :--- |
| Tenant / store pick | Subdomain lookup | Implemented |
| Staff login | Admin JWT + refresh | Implemented |
| Branch / warehouse scope | Headers `x-store-id`, `x-branch-id`, `x-warehouse-id` | Implemented |
| Roles & permissions | Hide screens by RBAC | API ready — UI pending |
| Push notifications | Order alerts, low stock, chat | API ready — UI pending |

### 3.2 Orders & Fulfillment

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Order list | Filter by status, branch | Ready |
| Order detail | Items, payment, customer, address | Ready |
| Update status | Confirm / cancel / process | Ready |
| Fulfillment flow | Pick → Pack → Ship | Ready |
| Returns handling | Approve / restock / wallet credit | Ready |
| Courier | Create shipment (Pathao / Steadfast / EasyPost), track | Ready |

### 3.3 POS (high value on phone / tablet)

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Open / close shift | Cashier shift control | Ready |
| Cash drawer | In / out | Ready |
| Barcode scan sale | Product lookup by barcode | Ready |
| Cart & tender | Cash / card / mobile / wallet / split pay | Ready |
| Offline sync | Idempotent sale sync via `clientSaleId` / `offlineSaleId` | Ready |
| Receipt | Print / share | Client-side |

### 3.4 Inventory (ops only — not reports)

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Stock lookup | Search product / variant stock by warehouse | Ready |
| Stock transfer | Approve → ship → receive | Ready |
| Cycle count | Count & submit variance | Ready |
| GRN receive | Goods received vs PO | Ready |
| Batch / expiry | View lots, FEFO awareness | Ready |
| Low-stock alerts | Push when below threshold | Partial (listings exist; auto alerts incomplete) |

### 3.5 Customers & Support

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Customer lookup | Find by phone / email for POS / orders | Ready |
| Credit check | Credit hold / limit at sale | Ready |
| Live agent chat | Support conversations + read receipts | Ready |
| In-app inbox | Notifications list / mark read | Ready |

### 3.6 HRM (field staff)

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Attendance punch | Check-in / check-out (GPS geofence if enabled) | Ready |
| Leave request | Submit / view leave status | Ready |
| My profile | Employee info | Ready |

### 3.7 Catalog ops (optional field use)

| Feature | Details | API readiness |
| :--- | :--- | :--- |
| Quick product edit | Price / stock visibility, status toggle | Ready |
| Media upload | Photos via presigned S3 / MinIO URLs | Ready |
| Label / barcode | Scan & verify SKUs | Client-side + catalog APIs |

---

## 4. Explicitly Excluded from Mobile

Do **not** ship these in either mobile app:

- Analytics / KPI dashboards  
- P&L, balance sheet, cash-flow reports  
- Campaign performance boards  
- Super-admin platform overview  
- Heavy accounting journals UI  
- Full procurement RFQ workflows (keep only receive / GRN on mobile)

---

## 5. Build Priority Roadmap

### Customer app — Phase 1 (MVP)

1. Auth + profile  
2. Catalog browse + product detail  
3. Cart + checkout + payment  
4. My orders + tracking  
5. Address book + wishlist  

### Customer app — Phase 2

6. Wallet + loyalty  
7. Returns  
8. Push + live chat  
9. AI search / assistant  
10. Offers / reviews  

### Merchant app — Phase 1 (MVP)

1. Tenant + login + scope *(already started in `native-app/`)*  
2. Orders list / detail + status update  
3. Fulfillment pick / pack / ship  
4. Push notifications  

### Merchant app — Phase 2

5. POS + offline sync  
6. Inventory lookup + transfers + GRN  
7. Courier create / track  
8. Agent chat  
9. Attendance punch  

---

## 6. Architecture Notes for Mobile

| Topic | Detail |
| :--- | :--- |
| API prefix | `/api/v1` |
| Multi-tenant | Resolve store by subdomain / custom domain or `x-store-id` |
| Customer routes | Often `@CustomerRoute()` + JWT (skip staff permission checks) |
| Public routes | Catalog, AI, payment callbacks use `@Public()` |
| Staff scope | Send `x-store-id`, `x-branch-id`, `x-warehouse-id` on every ops request |
| Offline POS | Idempotent sync via `offlineSaleId` / `clientSaleId` |
| Real-time | Socket.IO (chat + notifications) + FCM push |
| Payments | SSLCommerz (BDT); Stripe keys referenced in settings |
| Couriers | Pathao, Steadfast, EasyPost + webhooks |

### Key paths

| Area | Path |
| :--- | :--- |
| Server modules | `server/src/modules/` |
| Storefront UI | `client/app/(user)/` |
| Admin UI | `client/app/admin/` |
| Native app | `native-app/` |
| Technical mobile blueprint | [`doc/MOBILE_APP_GUIDE.md`](MOBILE_APP_GUIDE.md) |
| Docs index | [`doc/README.md`](README.md) |

---

## 7. Tech Stack Reference

| Layer | Stack |
| :--- | :--- |
| API | NestJS 11, TypeORM, PostgreSQL, Redis, BullMQ, Socket.IO, Passport JWT |
| Web | Next.js, React, Tailwind, next-auth |
| Mobile (existing) | Expo ~57, Expo Router, NativeWind, Zustand, Axios, expo-secure-store |
| Infra | MinIO/S3, Nodemailer, FCM / web-push, SMS |

---

*This document is the product feature inventory for mobile. For implementation patterns, hardware, and Expo architecture, see [`MOBILE_APP_GUIDE.md`](MOBILE_APP_GUIDE.md).*
