# Enterprise Multi-Tenant SaaS ERP — Documentation Index

**Platform:** eCommerce Multi-Tenant SaaS ERP  
**Stack:** NestJS · TypeORM · PostgreSQL · Redis · BullMQ · Next.js  
**Architecture:** Modular Monolith · Event-Driven · Ledger-Based · GAAP-Compliant  
**Last Updated:** May 24, 2026  

---

## How to Use This Documentation

This folder is the single source of truth for the entire ERP platform. Documentation is organized into three main directories. Start with the guide that matches your role:

| I am a... | Start here |
| :--- | :--- |
| **New Developer** (reading code) | [`codebase-understanding/README.md`](codebase-understanding/README.md) |
| **New Developer** (coding standards) | [`developer/DEVELOPER_GUIDE.md`](developer/DEVELOPER_GUIDE.md) |
| **System Architect / reviewer** | [`system-design/erp_master_system_design.md`](system-design/erp_master_system_design.md) |
| **Engineer tracing a feature end-to-end** | [`system-design/erp_master_dataflow.md`](system-design/erp_master_dataflow.md) |
| **Platform Super-Admin** (SaaS Owner) | [`manuals/01_SUPER_ADMIN_MANUAL.md`](manuals/01_SUPER_ADMIN_MANUAL.md) |
| **Tenant Owner / Business CFO** | [`manuals/02_TENANT_OWNER_MANUAL.md`](manuals/02_TENANT_OWNER_MANUAL.md) |
| **Store Cashier / POS staff** | [`manuals/03_POS_CASHIER_MANUAL.md`](manuals/03_POS_CASHIER_MANUAL.md) |
| **Accountant / Bookkeeper** | [`manuals/04_ACCOUNTANT_MANUAL.md`](manuals/04_ACCOUNTANT_MANUAL.md) |
| **HR Specialist / Payroll Manager** | [`manuals/05_HR_PAYROLL_MANUAL.md`](manuals/05_HR_PAYROLL_MANUAL.md) |
| **Warehouse / Inventory Supervisor** | [`manuals/06_INVENTORY_MANAGER_MANUAL.md`](manuals/06_INVENTORY_MANAGER_MANUAL.md) |
| **Procurement Officer** | [`manuals/07_PROCUREMENT_OFFICER_MANUAL.md`](manuals/07_PROCUREMENT_OFFICER_MANUAL.md) |

---

## 1. System Design Directory (`system-design/`)

> Deep architectural specifications, boundary rules, database designs, and feature roadmaps.

### 1.1 Core Design Foundations
*   [`erp_master_system_design.md`](system-design/erp_master_system_design.md) — **The Core System Blueprint**: Covers modular monolith contexts, guard middleware scopes, eventual consistency, reliability, and deployment strategy.
*   [`erp_business_logic_deep_dive.md`](system-design/erp_business_logic_deep_dive.md) — **Business Logic Deep Dive**: Real-world business examples, module-by-module business rules, add/update/remove behaviour, module connections, edge cases, and end-to-end scenarios. Read this when you need to understand why the ERP behaves a certain way.
*   [`erp_master_dataflow.md`](system-design/erp_master_dataflow.md) — **Master Dataflow Map**: End-to-end module-by-module data flow (UI → guards → controller → service → ledgers → outbox → BullMQ), row-level write maps, and code-vs-docs discrepancy log. Read after the master system design.
*   [`erp_low_level_system_design.md`](system-design/erp_low_level_system_design.md) — **Low-Level Code Contracts**: Details the NestJS request processing guard chain, typed BullMQ payloads, ledger boundaries, transaction handling, and migration rules.
*   [`erp_master_database_design.md`](system-design/erp_master_database_design.md) — **Master DB Schema**: Contains the unified database ERDs (Mermaid), 107-table inventory, schema definitions, indexes, and tenant-isolation rules.
*   [`erp_documentation_and_user_manual_plan.md`](system-design/erp_documentation_and_user_manual_plan.md) — Documentation strategy and writing phases.
*   [`developer_architecture_onboarding.md`](system-design/developer_architecture_onboarding.md) — **Developer Architectural Onboarding & System Flow Map**: Explains modular monolith layouts, request guard pipelines, double-entry verification flowchart, and offline POS sync strategies.
*   [`erp_remaining_roadmap.md`](system-design/erp_remaining_roadmap.md) — Implementation roadmap and task tracking.
*   [`erp_subscription_feature_completion_matrix.md`](system-design/erp_subscription_feature_completion_matrix.md) — Feature completion matrix compared against the codebase and subscription gates.

### 1.2 Supporting Module & Product Specs
*   [`crm_loyalty_requirements.md`](system-design/crm_loyalty_requirements.md) — Wallets, loyalty points, customer credit holds, and AR aging tracking.
*   [`live_chat_system_design.md`](system-design/live_chat_system_design.md) — Real-time support via WebSockets and Socket.io.
*   [`live_chat_support_requirements.md`](system-design/live_chat_support_requirements.md) — Support-agent and merchant-facing live chat requirements.
*   [`phase5_courier_analysis.md`](system-design/phase5_courier_analysis.md) — Integration analysis for local third-party couriers (Pathao/Steadfast).
*   [`campaign_requirements.md`](system-design/campaign_requirements.md) — Messaging campaign and audience-targeting requirements.

### 1.3 Subscriptions, Custom Domains & Platform Design
*   [`subscription_plan_entitlements.md`](system-design/subscription_plan_entitlements.md) — Subscription tier matrices, gating, and usage caps.
*   [`subscription_ui_suggestions.md`](system-design/subscription_ui_suggestions.md) — Front-end billing and plan tier checkout layouts.
*   [`custom_domains_feature.md`](system-design/custom_domains_feature.md) — SSL, DNS CNAME verification, and reverse proxy routing setup.
*   [`page_builder_architecture.md`](system-design/page_builder_architecture.md) — Landing page grid block model renderer.
*   [`ecommerce_builder_feature.md`](system-design/ecommerce_builder_feature.md) — Gated landing page options for basic subscription tiers.
*   [`admin_sidebar_proposal.md`](system-design/admin_sidebar_proposal.md) — Dynamic sidebar rendering based on subscription and RBAC roles.
*   [`multi_warehouse_stock_documents_analysis.md`](system-design/multi_warehouse_stock_documents_analysis.md) — Warehouse routing rules and split-shipment strategies.

---

## 2. Developer Documentation Directory (`developer/`)

> Implementation templates, coding standards, database scripts, and strategy guides.

*   [`DEVELOPER_GUIDE.md`](developer/DEVELOPER_GUIDE.md) — **Core Developer Manual**: Request processing pipeline, 5-step module creation pattern with TS templates, DB unique constraints, S3 bucket partitioning, BullMQ stock updates, and Redis caching.
*   [`discount_and_promotion_strategy.md`](developer/discount_and_promotion_strategy.md) — **Campaign Engine**: Rules-based coupon engine using the Strategy Pattern with factory implementations (fixed, percentage, free shipping).
*   [`database_migration_guide.md`](developer/database_migration_guide.md) — Safe TypeORM migration templates to prevent write locks on high-volume tables.
*   [`event_driven_architecture.md`](developer/event_driven_architecture.md) — EventEmitter schema registers and subscriber patterns.
*   [`api_caching_strategy.md`](developer/api_caching_strategy.md) — Cache invalidation rules and Redis keyspaces.
*   [`erp_module_architecture.md`](developer/erp_module_architecture.md) — Modular monolith interface contracts.
*   [`catalog_module_implementation_guide.md`](developer/catalog_module_implementation_guide.md) — Catalog details (attributes, pricing lists, multi-currency).
*   [`erp_hrm_module_guideline.md`](developer/erp_hrm_module_guideline.md) — HRM payroll calculations and attendance punches.
*   [`erp_stock_transfer_implementation_steps.md`](developer/erp_stock_transfer_implementation_steps.md) — Multi-step inter-warehouse stock transfer steps.
*   [`dynamic_role_feature_permission.md`](developer/dynamic_role_feature_permission.md) — RBAC DB permissions seeding script.
*   [`erp_deeper_understand_guide.md`](developer/erp_deeper_understand_guide.md) — Conceptual guide explaining business rules of accounting/money to developers.

---

## 3. Codebase Understanding Directory (`codebase-understanding/`)

> Module-by-module technical breakdown of every feature implemented in `server/src/`. The definitive resource for developers who need to understand how any part of the system works before writing or reviewing code.

| Document | Domains Covered |
| :--- | :--- |
| [`01_system_infrastructure.md`](codebase-understanding/01_system_infrastructure.md) | Tenant, Subscription, Organization (Branch/Warehouse), Audit Log |
| [`02_catalog_and_marketing.md`](codebase-understanding/02_catalog_and_marketing.md) | Products, Variants, Categories, Price Books, Loyalty, Campaigns, Site Settings |
| [`03_sales_and_pos.md`](codebase-understanding/03_sales_and_pos.md) | Orders, Returns, POS Registers, Cashier Shifts, Cash Drawer, Coupons, Promotions |
| [`04_logistics_and_inventory.md`](codebase-understanding/04_logistics_and_inventory.md) | Inventory Ledger, Batch/Expiry Lots, Reservations, Transfers, GRN, Fulfillment, Courier |
| [`05_finance_and_procurement.md`](codebase-understanding/05_finance_and_procurement.md) | COA, GL Journals, AP (POs, Supplier Invoices, Payments, 3-Way Match) |
| [`06_hrm_module.md`](codebase-understanding/06_hrm_module.md) | Employees, Attendance, Leave, Payroll Batches, Payslips, GL Integration, Recruitment |
| [`07_auth_and_rbac.md`](codebase-understanding/07_auth_and_rbac.md) | JWT Auth, Roles, Permissions, Scope Assignments, Permission Overrides, Guard Chain |
| [`08_finance_reporting_and_tax.md`](codebase-understanding/08_finance_reporting_and_tax.md) | P&L, Balance Sheet, Cash Flow, VAT/Tax Engine, AR Dunning, Operational Reports |
| [`09_infrastructure_services.md`](codebase-understanding/09_infrastructure_services.md) | Redis Cache, BullMQ Queues, File Uploads, Mail, Chat (Socket.IO), Push (FCM), SMS |
| [`10_customer_crm_and_storefront.md`](codebase-understanding/10_customer_crm_and_storefront.md) | Customer Profiles, Wallet/AR/Loyalty Ledgers, Lead Pipeline, Cart, Wishlist |

---

## 4. User Manuals Directory (`manuals/`)

> Persona-based operation manuals and compliance guidelines.

### 3.1 Role-Based End-User Manuals
*   [`01_SUPER_ADMIN_MANUAL.md`](manuals/01_SUPER_ADMIN_MANUAL.md) — Super-admin operations, subscription billing upgrades/suspensions, domain audits, GDPR data dumps, and queue monitoring.
*   [`02_TENANT_OWNER_MANUAL.md`](manuals/02_TENANT_OWNER_MANUAL.md) — Multi-company configuration, branch/warehouse definitions, staff invitations, and profit/loss reports.
*   [`03_POS_CASHIER_MANUAL.md`](manuals/03_POS_CASHIER_MANUAL.md) — Opening/closing shifts, scanner checkouts, split payments, offline mode sync, cash drawer adjustments, Z-reports.
*   [`04_ACCOUNTANT_MANUAL.md`](manuals/04_ACCOUNTANT_MANUAL.md) — Chart of Accounts, manual journal entries, reversals, 3-way invoice matching, supplier ledger, AP/AR aging statements, tax sandbox filing.
*   [`05_HR_PAYROLL_MANUAL.md`](manuals/05_HR_PAYROLL_MANUAL.md) — Employee personal dossiers, GPS geofenced punch attendance checks, leave quotas, monthly payroll auto-runs.
*   [`06_INVENTORY_MANAGER_MANUAL.md`](manuals/06_INVENTORY_MANAGER_MANUAL.md) — GRN verification, cycle counting, variance adjustments, FEFO batch sorting.
*   [`07_PROCUREMENT_OFFICER_MANUAL.md`](manuals/07_PROCUREMENT_OFFICER_MANUAL.md) — Purchase Orders, supplier records, portal access permissions, debit notes.

### 3.2 Reference Operational Guidelines
*   [`00_SUPER_ADMIN_GUIDELINES.md`](manuals/00_SUPER_ADMIN_GUIDELINES.md) — Platform support checklists.
*   [`08_HRM_TEAM_MANAGEMENT_GUIDELINE.md`](manuals/08_HRM_TEAM_MANAGEMENT_GUIDELINE.md) — HRM employee onboarding setup instructions.
*   [`09_TENANT_OWNER_ONBOARDING_GUIDE.md`](manuals/09_TENANT_OWNER_ONBOARDING_GUIDE.md) — Setup guidelines for new business stores.

---

## 4. Architecture at a Glance

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

## 5. Domain Event Map

All financial and inventory side-effects flow through asynchronous events:

| Event | Emitted By | Side Effect |
| :--- | :--- | :--- |
| `order.paid` | Sales / POS | Journal: DR Cash or AR / CR Revenue + DR COGS / CR Inventory |
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
