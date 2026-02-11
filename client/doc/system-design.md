# 🧠 System Design – Multi-Tenant eCommerce Landing Page SaaS

## 1. Overview

A SaaS platform that allows multiple businesses (tenants) to create high-performance eCommerce landing pages using subdomains or custom domains, manage products and orders, and accept payments, while the platform owner controls plans, usage, and scaling.

---

## 2. Goals & Constraints

### Goals

- Support thousands of stores (tenants)
- Handle high read traffic (marketing pages)
- Strong tenant isolation
- Fast page load (SEO + conversion)
- Easy customization per store
- Cost-efficient scaling

### Constraints

- One shared codebase
- Minimal operational overhead
- Secure payments & domains

---

## 3. Users

- **Visitors (Buyers):** Browse landing pages, view products, checkout
- **Store Owners (Tenants):** Configure store, products, domains, view orders
- **Super Admin:** Manage tenants, plans, usage, suspensions

---

## 4. Functional Requirements

### Core

- Multi-tenant store creation
- Subdomain & custom domain routing
- Landing page rendering
- Product & order management
- Payment processing
- Admin control

### Secondary

- Analytics
- SEO
- Marketing integrations

---

## 5. Non-Functional Requirements

| Category        | Requirement             |
| --------------- | ----------------------- |
| Scalability     | 100k+ daily visitors    |
| Performance     | <200ms TTFB             |
| Availability    | 99.9%                   |
| Security        | Strong tenant isolation |
| Maintainability | Modular services        |

---

## 6. High-Level Architecture

```
Browser
   |
Cloudflare (DNS, CDN, SSL, WAF)
   |
Load Balancer (Nginx / ALB)
   |
App Servers (Next.js + NestJS)
   |
---------------------------------
| PostgreSQL | Redis | Object Storage (S3) |
---------------------------------
```

### Why this works

- CDN handles traffic spikes
- Stateless app servers allow horizontal scaling
- Redis reduces DB load
- S3 offloads media traffic

---

## 7. Request Flow (Public Page)

```
Visitor → Domain → Cloudflare
        → Load Balancer
        → App Server
        → Resolve Tenant by Host
        → Fetch Cached Store Config
        → Render Page
```

---

## 8. Domain → Tenant Resolution (Critical)

### Logic

- Extract `Host` header
- Match against:
  - `subdomain.yoursaas.com`
  - `customdomain.com`

### Resolution

```
tenants
- id
- subdomain
- custom_domain
- status
```

Result is cached in Redis.

---

## 9. Multi-Tenant Data Design

### Strategy: Shared DB + tenant_id

Example tables:

```
tenants (id, name, plan)
products (id, tenant_id, name, price)
orders (id, tenant_id, total, status)
```

### Indexing

- Index on `tenant_id` for all tenant-bound tables

---

## 10. Caching Strategy

### CDN (Cloudflare)

- Cache by hostname
- Cache public pages only
- Bypass admin & checkout

### Redis

- Tenant resolution
- Store settings
- Rate limiting

### App-Level

- Next.js ISR for landing pages

---

## 11. Payment Flow

```
Customer → Checkout
        → Payment Gateway
        → Webhook → Backend
        → Verify Signature
        → Create Order
```

- Never trust frontend payment status
- Idempotent webhook handling

---

## 12. Security Design

- Tenant resolved server-side only
- JWT for store owners
- HTTPS everywhere
- Rate limiting per IP
- WAF rules (Cloudflare)

---

## 13. Scaling Strategy

### Application

- Dockerized services
- Horizontal scaling

### Database

- Connection pooling
- Read replicas (future)

### Background Jobs

- Emails
- Analytics
- Cleanup tasks

---

## 14. Monitoring & Reliability

- Logging: Winston
- Metrics: Prometheus
- Alerts: Uptime + error rate
- Backups: Daily DB snapshots

---

## 15. Bottlenecks & Mitigation

| Bottleneck        | Solution      |
| ----------------- | ------------- |
| High read traffic | CDN + cache   |
| DB overload       | Redis caching |
| Tenant lookup     | Redis cache   |
| Media traffic     | S3 + CDN      |

---

## 16. Deployment Strategy

- Frontend: Vercel or Node + Nginx
- Backend: Docker on VPS / Cloud
- CI/CD: GitHub Actions

---

## 17. Trade-offs

- Shared DB vs DB per tenant → chose shared for cost & simplicity
- SSR vs ISR → ISR for speed & SEO

---

## 18. Summary

This design prioritizes **performance, isolation, and scalability**, similar to Shopify-style SaaS. It is production-ready, interview-ready, and can scale from MVP to enterprise with minimal rework.

🧠 FINAL MASTER LIST (SHORT + COMPLETE)
✅ Core (Must Do)

Requirements

Architecture

Database

Auth & RBAC

Business logic

Background jobs

Logging & audit

Deployment & monitoring

🚀 Advanced (Enterprise+)

Config management

Transactions

API standards

Caching strategy

Rate limiting

Search & reporting

Failure handling

Compliance

Scaling strategy
