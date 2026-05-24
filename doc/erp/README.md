# Enterprise Multi-Tenant SaaS ERP — Documentation Index

**Platform:** eCommerce Multi-Tenant SaaS ERP  
**Stack:** NestJS · TypeORM · PostgreSQL · Redis · BullMQ · Next.js  
**Architecture:** Modular Monolith · Event-Driven · Ledger-Based · GAAP-Compliant  
**Last Updated:** May 2026  

---

## How to Use This Documentation

This folder is the single source of truth for the entire ERP platform. Documentation is organized into four areas. Start with the area that matches your role:

| I am a... | Start here |
| :--- | :--- |
| **New developer** joining the team | [`developer/DEVELOPER_GUIDE.md`](developer/DEVELOPER_GUIDE.md) |
| **Architect** reviewing system design | [`system-design/`](system-design/) |
| **Store Owner / Manager** | [`manuals/02_TENANT_OWNER_MANUAL.md`](manuals/02_TENANT_OWNER_MANUAL.md) |
| **Cashier / POS staff** | [`manuals/03_POS_CASHIER_MANUAL.md`](manuals/03_POS_CASHIER_MANUAL.md) |
| **Accountant / CFO** | [`manuals/04_ACCOUNTANT_MANUAL.md`](manuals/04_ACCOUNTANT_MANUAL.md) |
| **HR / Payroll Officer** | [`manuals/05_HR_PAYROLL_MANUAL.md`](manuals/05_HR_PAYROLL_MANUAL.md) |
| **Inventory / Warehouse Manager** | [`manuals/06_INVENTORY_MANAGER_MANUAL.md`](manuals/06_INVENTORY_MANAGER_MANUAL.md) |
| **Procurement Officer** | [`manuals/07_PROCUREMENT_OFFICER_MANUAL.md`](manuals/07_PROCUREMENT_OFFICER_MANUAL.md) |
| **Platform Super-Admin** (SaaS owner) | [`manuals/01_SUPER_ADMIN_MANUAL.md`](manuals/01_SUPER_ADMIN_MANUAL.md) |

---

## 1. System Design Documents

> Architecture, database diagrams, and engineering decisions for the entire platform.

| File | Purpose |
| :--- | :--- |
| [`system-design/erp_master_system_design.md`](system-design/erp_master_system_design.md) | **The definitive high-level system design** — boundaries, guard chain, technology stack, all 15 module contexts, domain invariants, reliability, deployment, and phased roadmap. 1,500+ lines. |
| [`system-design/erp_low_level_system_design.md`](system-design/erp_low_level_system_design.md) | **Low-level design** — guard chain with ASCII diagram, RequestContextDto contract, typed BullMQ job schemas, event-driven accounting outbox, cross-domain transaction patterns, TypeORM migration safety rules, Redis cache key conventions. |
| [`system-design/erp_master_database_design.md`](system-design/erp_master_database_design.md) | **Master database design** — 4 design principles, full Mermaid ERD, field-level schemas for all 8 domains, composite index strategy, UUIDv7 clustering guidance. |
| [`system-design/erp_current_and_recommended_features.md`](system-design/erp_current_and_recommended_features.md) | Feature audit — all 42+ implemented features listed by domain, plus 8 missing enterprise features (Manufacturing/MRP, Fixed Assets, E-Invoicing, SCM/RFQ, CRM Pipeline, Open API, Scheduled Reports, DMS) with priority matrix. |
| [`system-design/erp_documentation_and_user_manual_plan.md`](system-design/erp_documentation_and_user_manual_plan.md) | Strategic plan for all coding documentation and user manuals — goals, audience breakdown, execution timeline. |

---

## 2. Developer Documentation

> Engineering guides, code patterns, and standards for the development team.

| File | Purpose |
| :--- | :--- |
| [`developer/DEVELOPER_GUIDE.md`](developer/DEVELOPER_GUIDE.md) | **Core developer guide** — request pipeline, 5-step module creation pattern (Entity → Repository → Service → Controller → Module), multi-tenant DB security rules, S3 scoping, BullMQ ledger integration, balanced double-entry validation, Redis cache-aside pattern. |

---

## 3. User Manuals

> Role-based operation guides for each persona using the ERP system.

| Manual | Audience | Key Topics |
| :--- | :--- | :--- |
| [`manuals/01_SUPER_ADMIN_MANUAL.md`](manuals/01_SUPER_ADMIN_MANUAL.md) | Platform Owner / DevOps | Platform dashboard, subscription plan management, custom domain approval, tenant data management (GDPR), queue monitoring |
| [`manuals/02_TENANT_OWNER_MANUAL.md`](manuals/02_TENANT_OWNER_MANUAL.md) | Business Owner / CEO / CFO | Company setup, branches & warehouses, staff onboarding, role management, catalog, P&L reports |
| [`manuals/03_POS_CASHIER_MANUAL.md`](manuals/03_POS_CASHIER_MANUAL.md) | Cashier / Counter Staff | Shift opening/closing, barcode checkout, split payments, offline mode, returns & exchanges, cash drawer operations |
| [`manuals/04_ACCOUNTANT_MANUAL.md`](manuals/04_ACCOUNTANT_MANUAL.md) | Accountant / CFO | Chart of Accounts, journal entries, reversal entries, 3-way AP matching, supplier payments, AR management, credit holds, VAT engine, financial reports |
| [`manuals/05_HR_PAYROLL_MANUAL.md`](manuals/05_HR_PAYROLL_MANUAL.md) | HR Manager / Payroll Officer | Employee onboarding, attendance management, leave quotas & approvals, payroll batch generation → GL posting, payslip download, recruitment pipeline |
| [`manuals/06_INVENTORY_MANAGER_MANUAL.md`](manuals/06_INVENTORY_MANAGER_MANUAL.md) | Inventory / Warehouse Manager | Stock levels, GRN receiving, inter-warehouse transfers, stock adjustments, cycle counts, FEFO batch/expiry management, inventory reports |
| [`manuals/07_PROCUREMENT_OFFICER_MANUAL.md`](manuals/07_PROCUREMENT_OFFICER_MANUAL.md) | Procurement Officer | Supplier management, supplier portal, PO lifecycle, GRN verification, 3-way match, debit notes, supplier payments, AP aging |

---

## 4. Reference & Feature Documentation

> Original design blueprints, module guidelines, and feature specifications.

| File | Purpose |
| :--- | :--- |
| [`ERP-Deeper-Understand-Guide.md`](ERP-Deeper-Understand-Guide.md) | Plain-English explanation of all ERP business concepts for developers new to enterprise systems |
| [`2.ERP-Module-Architecture.md`](2.ERP-Module-Architecture.md) | Domain module architecture, event flows, and bounded context definitions |
| [`ERP-Architecture.md`](ERP-Architecture.md) | Core architectural decisions and domain boundaries |
| [`erp_feature_list.md`](erp_feature_list.md) | Original ERP feature roadmap requirements document |
| [`ERP-Remaining-Roadmap.md`](ERP-Remaining-Roadmap.md) | Phased implementation roadmap with completion status |
| [`dynamic_role_feature_permission.md`](dynamic_role_feature_permission.md) | RBAC permission codes, role definitions, and assignment rules |
| [`CRM-LOYALTY-REQUIREMENTS.md`](CRM-LOYALTY-REQUIREMENTS.md) | CRM, loyalty points, and wallet system requirements |
| [`CATALOG-MODULE-IMPLEMENTATION-GUIDE.md`](CATALOG-MODULE-IMPLEMENTATION-GUIDE.md) | Catalog module implementation guide |
| [`ERP-HRM-Module-Guideline.md`](ERP-HRM-Module-Guideline.md) | HRM module design guidelines |
| [`ERP-Procurement-Module-Guideline.md`](ERP-Procurement-Module-Guideline.md) | Procurement module design |
| [`Finance-Accounting-Design.md`](Finance-Accounting-Design.md) | Finance and accounting domain design |
| [`POS-Retail-Design.md`](POS-Retail-Design.md) | POS and retail module design |
| [`ERP-Multi-Branch-Scoping.md`](ERP-Multi-Branch-Scoping.md) | Multi-branch and warehouse boundary rules |
| [`subscription_plan_entitlements.md`](subscription_plan_entitlements.md) | Subscription plan feature entitlement matrix |

---

## 5. Architecture at a Glance

```
                    ┌──────────────────────────────────────────┐
                    │          Multi-Tenant SaaS ERP           │
                    │  NestJS · Next.js · PostgreSQL · Redis   │
                    └────────────────────┬─────────────────────┘
                                         │
           ┌─────────────────────────────┼──────────────────────────┐
           ▼                             ▼                           ▼
   ┌───────────────┐           ┌──────────────────┐       ┌──────────────────┐
   │  Storefront   │           │   Admin Panel    │       │   POS Terminal   │
   │  (Next.js)    │           │   (Next.js)      │       │   (PWA Offline)  │
   └───────┬───────┘           └────────┬─────────┘       └────────┬─────────┘
           │                            │                           │
           └────────────────────────────┼───────────────────────────┘
                                         ▼
                             ┌──────────────────────┐
                             │  NestJS API Server   │
                             │  Guard Chain:        │
                             │  JWT → Subscription  │
                             │  → Permission →      │
                             │  BranchScope         │
                             └──────────┬───────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                           ▼
   ┌──────────────────┐      ┌──────────────────────┐    ┌──────────────────┐
   │   PostgreSQL     │      │   Redis Cache        │    │  BullMQ Queues   │
   │ (Ledger-Based    │      │ (t:{tenantId}:key)   │    │ stock · journal  │
   │  Multi-Tenant)   │      │                      │    │ email · reports  │
   └──────────────────┘      └──────────────────────┘    └──────────────────┘
```

---

## 6. Domain Event Map

All financial and inventory side-effects flow through asynchronous events:

| Event | Emitted By | Side Effect |
| :--- | :--- | :--- |
| `order.paid` | Sales / POS | Journal: DR Cash / CR Revenue + DR COGS / CR Inventory |
| `grn.verified` | Logistics | Inventory ledger IN + Journal: DR Inventory / CR AP |
| `supplier.payment.released` | Procurement | Journal: DR AP / CR Cash at Bank |
| `payroll.batch.approved` | HRM | Journal: DR Salary Expense / CR Salary Payable |
| `payroll.payment.released` | HRM | Journal: DR Salary Payable / CR Cash at Bank |
| `expense.created` | Finance | Journal: DR Expense / CR Cash |
| `order.returned` | Sales | Stock reverse + Journal reversal |
| `wallet.credited` | CRM | Journal: DR Revenue / CR Store Credit Liability |
| `wallet.redeemed` | Sales | Journal: DR Store Credit Liability / CR Revenue |

---

*This documentation suite covers the complete ERP system — from architecture to operation. For questions, contact the Platform Engineering team.*
