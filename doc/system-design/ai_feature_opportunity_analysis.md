# AI Feature Opportunity Analysis

> **Purpose:** Identify where AI adds value across this multi-tenant eCommerce ERP — what is already built, what should be built next, and what must stay human-controlled.  
> **Audience:** Product, engineering, and implementation planning.  
> **Companion doc:** [AI System Guide](ai_system_guide.md) (A–Z architecture, configuration, APIs, file map).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [How AI Fits This Platform](#2-how-ai-fits-this-platform)
3. [Status at a Glance](#3-status-at-a-glance)
4. [Integration Patterns](#4-integration-patterns)
5. [Module-by-Module Analysis](#5-module-by-module-analysis)
6. [Priority Roadmap](#6-priority-roadmap)
7. [What AI Must Never Do](#7-what-ai-must-never-do)
8. [Technical Prerequisites](#8-technical-prerequisites)
9. [Success Metrics](#9-success-metrics)

---

## 1. Executive Summary

This platform treats AI as a **draft-and-approve productivity layer** on top of a deterministic ERP core ([ERP Master Design — Phase 7](erp_master_system_design.md#phase-7--future-aiapi-extension-separate-doc)). Tenants bring their own API keys; the platform does not host a shared LLM.

**Today (Phase A + B complete):**

- Configuration, multi-provider client, permissions, plan gating
- AI Studio (chat + product/campaign labs)
- Inline assist on **8 admin surfaces**: products, campaigns, FAQs, page SEO, coupons, promotions

**Biggest gaps (highest ROI next):**

| Gap | Why it matters |
|-----|----------------|
| **Catalog taxonomy copy** (categories, brands) | Same pain as products; high volume, repetitive SEO text |
| **Page builder block content** | SEO is done; hero/paragraph/button copy still manual |
| **Support chat assist** | Agents answer the same questions; FAQ + order context can speed replies |
| **Review moderation / reply drafts** | Trust & engagement; low risk if draft-only |
| **Async ERP jobs** (OCR, forecasting, AR drafts) | High value but needs `ai_jobs` queue + event hooks |

---

## 2. How AI Fits This Platform

```mermaid
flowchart LR
  subgraph Safe [Safe for AI — drafts only]
    Copy[Marketing & catalog copy]
    SEO[SEO meta fields]
    Draft[Email / SMS / push drafts]
    Suggest[Read-only recommendations]
  end

  subgraph Human [Human approval required]
    Save[Form save / publish]
    Post[Journal posting]
    Stock[Inventory movement]
    Pay[Payments & refunds]
  end

  subgraph Never [Never automate]
    Ledger[GL / finance writes]
    Scope[Tenant isolation decisions]
    Perm[Permission grants]
  end

  Copy --> Save
  SEO --> Save
  Draft --> Save
  Suggest --> Human
```

**Rules (non-negotiable):**

1. AI returns **suggestions**; existing APIs persist data only when a user saves.
2. AI **never** posts journals, adjusts stock, issues refunds, or changes prices without explicit human action.
3. AI **never** bypasses tenant isolation, RBAC, or plan feature gates.
4. Sensitive finance/HRM data should only be sent to the LLM when the tenant opts in and the use case is read-only summarization.

---

## 3. Status at a Glance

Legend: ✅ Implemented · 🟡 Partial · ⬜ Not started · 🔒 Planned (needs async/infra)

### 3.1 Admin — Content & Marketing

| Area | Route / surface | AI need | Status | Suggested capability |
|------|-----------------|---------|--------|-------------------|
| AI configuration | `/admin/settings/ai` | Provider setup | ✅ | — |
| AI Studio | `/admin/ai` | Sandbox for chat & generation | ✅ | Add FAQ/page/marketing tabs |
| Products | `/admin/products/new` | Descriptions + SEO | ✅ | Bulk generate, variant copy |
| Categories | `/admin/categories` | Name → description + SEO | ✅ | `CatalogAiAssist` + `metaTitle` / `metaDescription` |
| Brands | `/admin/brands` | Brand story + SEO | ✅ | `CatalogAiAssist` + `metaTitle` / `metaDescription` |
| Campaigns | `/admin/campaigns` | Email/SMS/push copy | ✅ | Audience-aware variants |
| Coupons | `/admin/coupons` | Customer-facing description | ✅ | Suggest code names (optional) |
| Promotions | `/admin/promotions` | Offer description | ✅ | — |
| FAQs | `/admin/faqs` | Q&A from topic | ✅ | Bulk import from doc/PDF |
| Page builder — SEO | Page customizer | Meta title/description | ✅ | — |
| Page builder — blocks | Page customizer sections | Headings, paragraphs, CTAs | ✅ | `PageBlockAiAssist` on heading/paragraph/button/text-block |
| Store SEO settings | `/admin/settings/marketing` | Site-wide meta defaults | ✅ | `StoreSeoAiAssist` + `metaTitle` field |
| Loyalty program | `/admin/marketing/loyalty` | Rule explanations, email copy | ✅ | `LoyaltyProgramAiAssist` + `LoyaltyRuleAiAssist` |
| Newsletter / leads | `/admin/leads` | Follow-up email drafts | ✅ | `LeadFollowUpModal` + nurture intents |

### 3.2 Admin — Sales, Support & CRM

| Area | Route | AI need | Status | Suggested capability |
|------|-------|---------|--------|-------------------|
| Dashboard | `/admin` | Natural-language KPI questions | ✅ | `DashboardCopilot` — read-only KPI snapshot |
| Orders | `/admin/orders` | Status explanation, customer email draft | ✅ | `OrderAiAssistModal` on list + order detail |
| Returns | `/admin/returns` | Refund explanation letter | ✅ | Draft only |
| Customers | `/admin/customers` | Support summary, segment labels | ✅ | Read-only profile summary |
| Live chat | `/admin/support` | Suggested replies | ✅ | FAQ + order lookup context |
| Reviews | `/admin/reviews` | Reply draft, toxicity flag | ✅ | Moderation assist |
| Active carts | `/admin/carts` | Abandoned cart message | ✅ | Draft only (manual); `cart.abandoned` automation Phase C |

### 3.3 Admin — Catalog & Media

| Area | Route | AI need | Status | Suggested capability |
|------|-------|---------|--------|-------------------|
| Products | `/admin/products` | Full listing copy | ✅ | Image alt-text from filename |
| Price books | `/admin/price-books` | Pricing rationale notes | ✅ | Internal draft notes only |
| Media library | `/admin/media` | Alt text, file naming | ✅ | Vision optional (OpenAI-compatible) |
| Reviews (catalog) | `/admin/reviews` | See above | ✅ | — |

### 3.4 Admin — Operations & Inventory

| Area | Route | AI need | Status | Suggested capability |
|------|-------|---------|--------|-------------------|
| Inventory dashboard | `/admin/inventory` | Anomaly explanation | ✅ | Read-only narrative |
| Stock transfers | `/admin/stock-transfers` | Transfer reason notes | ✅ | Low priority |
| Cycle count | `/admin/cycle-count` | Variance explanation | ✅ | Read-only |
| Fulfillment | `/admin/fulfillment` | Packing slip notes | ✅ | Low priority |
| Batches / expiry | `/admin/batches` | Waste reduction tips | ✅ | Heuristic forecasting tie-in (read-only) |

### 3.5 Admin — Procurement (SCM)

| Area | Route | AI need | Status | Suggested capability |
|------|-------|---------|--------|-------------------|
| Requisitions | `/admin/procurement/requisitions` | Justification text | ✅ | Draft line notes |
| RFQs | `/admin/procurement/rfqs` | Supplier email body | ✅ | Campaign-copy pattern |
| Purchase orders | `/admin/procurement/purchases` | PO cover letter | ✅ | Low priority |
| GRN | `/admin/procurement/grn` | Receipt discrepancy notes | ✅ | Low priority |
| Supplier invoices | `/admin/procurement/invoices` | **Invoice OCR** | ✅ | Phase C — extract lines → draft (sync vision; no job queue) |
| Debit notes | `/admin/procurement/debit-notes` | Dispute letter draft | ✅ | Medium priority |
| Suppliers | `/admin/procurement/suppliers` | Supplier profile summary | ✅ | Low priority |

### 3.6 Admin — Finance

| Area | Route | AI need | Status | Suggested capability |
|------|-------|---------|--------|-------------------|
| AR aging | `/admin/finance/ar` | **Collection email drafts** | ✅ | Phase C — per overdue invoice (sync draft; manual send) |
| AP | `/admin/finance/ap` | **Payment reminder to internal approver** | ✅ | Phase C — aging row + batch tab (sync draft; manual send) |
| Expenses | `/admin/expenses` | **Categorization suggest** | ✅ | Phase C — expense form (sync suggest; user applies category) |
| P&L / reports | `/admin/reports/*` | **Executive summary narrative** | ✅ | Phase C — P&L, finance summary, cash flow (sync draft; numbers from DB) |
| Tax engine | `/admin/finance/tax` | **Rule explanation** | ✅ | Phase C — rules table + create modal (docs only; no calculation) |
| General ledger | `/admin/finance/ledger` | — | ❌ | **No AI writes to ledger** |

### 3.7 Admin — HRM

| Area | Route | AI need | Status | Suggested capability |
|------|-------|---------|--------|-------------------|
| Recruitment | `/admin/hrm/recruitment` | **Job description, screening questions** | ✅ | Phase C — post job modal (sync draft; screening Qs copy-only) |
| Performance | `/admin/hrm/performance` | **Review phrase bank** | ✅ | Phase C — new review modal (PII-minimized; draft only) |
| Payroll | `/admin/hrm/payroll` | **Payslip explanation to employee** | ✅ | Phase C — slip drawer (template fill from DB; draft only) |
| Leave policies | `/admin/hrm/leaves` | Policy FAQ generation | ⬜ | Link to store FAQ |

### 3.8 Storefront (customer-facing)

| Area | Surface | AI need | Status | Suggested capability |
|------|---------|---------|--------|-------------------|
| Product search | Storefront catalog | **Semantic / vector search** | ✅ | Phase D — hybrid keyword + vector (`GET /products?q=`); reindex at `/admin/settings` AI |
| Product pages | PDP | Q&A widget (“Ask about this product”) | ✅ | RAG on product fields + FAQs (`POST /products/slug/:slug/ask`) |
| Chat widget | Storefront | Shopping assistant | ✅ | RAG on catalog + FAQs (`POST /products/storefront-ai/chat`); no checkout |
| Checkout | Cart / checkout | — | ❌ | **No AI price or discount changes** |

**Full user + developer guide:** [manuals/12_STOREFRONT_AI_GUIDE.md](../manuals/12_STOREFRONT_AI_GUIDE.md)

### 3.9 Platform (Super Admin)

| Area | AI need | Status | Notes |
|------|---------|--------|-------|
| Plan descriptions | ✅ | Marketing copy for SaaS plans; configure provider at **Platform Settings → AI** |
| Tenant health | ✅ | Churn risk narrative from aggregate metrics (`POST /super-admin/ai/generate/tenant-health-narrative`) |
| Support tooling | ⬜ | Separate from tenant BYOK |

---

## 4. Integration Patterns

Use the same patterns already proven in Phase B:

| Pattern | When to use | Example in codebase |
|---------|-------------|---------------------|
| **Inline bar** | Form with 1–3 text fields | `AiInlineBar`, `ProductAiAssist`, `CampaignAiAssist` |
| **Inline button** | Single optional field | `DescriptionAiButton` on coupon/promotion |
| **AI Studio tab** | Experimentation, no form context | `AiStudio.tsx` tabs |
| **Chat panel** | Open-ended questions | `AiChatPanel` |
| **Async job** | OCR, bulk, post-create SEO | Not built — needs `ai_jobs` + BullMQ |
| **Copilot sidebar** | Cross-module questions | Phase D — tool-calling read APIs |

### Recommended reuse

| New feature | Reuse endpoint / hook |
|-------------|----------------------|
| Category / brand description | Extend `POST /ai/generate/product-content` or add `generate/catalog-entity` |
| Page block text | New `POST /ai/generate/page-content` with `blockType` |
| Support reply | `POST /ai/chat` + injected context (FAQ snippets, order status) |
| RFQ email | `POST /ai/generate/campaign-copy` with `channel: email` |
| Review reply | New `POST /ai/generate/review-reply` |

**Shared client hook:** `client/features/admin/ai/hooks/useAiGenerate.ts`  
**Shared UI:** `AiInlineBar`, `DescriptionAiButton`

---

## 5. Module-by-Module Analysis

### 5.1 Catalog (high value, low risk)

**Implemented:** Product name → description, short description, SEO title/description, tags.

**Still needed:**

1. **Categories** (`CategoryForm.tsx`) — `name`, `description`; no SEO fields today but valuable for category landing pages.
2. **Brands** (`BrandForm.tsx`) — `description` textarea; brand storytelling.
3. **Bulk product import** — After CSV import, batch-generate missing descriptions (async job).
4. **Image alt text** (`ProductMedia.tsx`, media library) — Accessibility + SEO; optional vision API.

**Why priority is high:** Same user workflow as products; copy-paste of `ProductAiAssist` pattern; no ERP side effects.

---

### 5.2 Marketing & Content (mostly done)

**Implemented:** Campaigns, coupons, promotions, FAQs, page SEO.

**Still needed:**

1. **Page builder blocks** (`SimpleContentEditor.tsx`) — `heading`, `paragraph`, `text-block`, `button` labels; merchants spend most time here after SEO.
2. **Global store SEO** (`MarketingSetting.tsx`) — default meta when page-level SEO empty.
3. **Loyalty** (`AdminLoyaltyPage.tsx`) — explain tiers/rewards in customer-friendly language.
4. **Abandoned cart** — Trigger on `cart.abandoned` event; draft SMS/email only (Phase C).

---

### 5.3 Support & CRM (high operational value)

**Live chat** (`SupportChat.tsx`) — Pure manual typing today.

| Capability | Inputs | Output | Risk |
|------------|--------|--------|------|
| Suggested reply | Last N messages + FAQ search + order ID if linked | Draft reply in input box | Low — agent sends manually |
| Conversation summary | Full thread | Bullet summary for handoff | Low |
| Intent tag | Message | `shipping`, `return`, `product` | Low |

**Orders / returns** — “Write customer email” button with order context (status, tracking, refund amount). Uses chat or dedicated endpoint; **must not** change order state.

---

### 5.4 Reviews & trust

**Reviews** (`ReviewCard.tsx`) — Display only; no admin reply flow visible.

| Capability | Value |
|------------|-------|
| Suggested public reply | Thank customer, address concern |
| Sentiment / policy flag | Highlight reviews needing attention |
| Fake review hint | Heuristic only; human decides |

---

### 5.5 Procurement & finance (Phase C — infrastructure required)

Per ERP Phase 7 backlog:

| Feature | Trigger | AI output | Human step |
|---------|---------|-----------|------------|
| Invoice OCR | Supplier invoice PDF upload | Line items, amounts, dates | Approve → create draft supplier invoice |
| AR collection draft | Invoice overdue N days | Email subject/body | Finance sends manually |
| Demand forecast | Scheduled job | Reorder quantity suggestion | Buyer approves PO |

These **require**:

- `ai_jobs` table + status tracking
- BullMQ `ai` queue
- Domain events (`supplier_invoice.uploaded`, `invoice.overdue`, `product.created`)
- Token usage logging for future billing

---

### 5.6 Reports & analytics (read-only copilot)

**Reports** (`/admin/reports/*`) — Charts and tables exist; no narrative layer.

| Capability | Example question | Data source |
|------------|------------------|-------------|
| Report narrator | “Why did margin drop this month?” | P&L + sales APIs (read-only) |
| Anomaly callout | “Stock for SKU X is unusually low” | Warehouse stock report |

**Phase D:** Admin copilot with **read-only** tools first (`listOrders`, `getStockLevel`); write tools only after audit trail exists.

---

### 5.7 HRM (medium priority, higher sensitivity)

| Feature | Notes |
|---------|-------|
| Job postings | Public copy; similar to product descriptions |
| Interview questions | Draft from job title + department |
| Performance review phrases | **PII risk** — minimize data sent to LLM |
| Payroll explanations | Template-based; no salary data in prompt if possible |

Recommend separate permission: `ai:use` with HRM scope or `ai:manage` policy for sensitive modules.

---

### 5.8 Storefront search & assistant (Phase D)

| Feature | Dependency |
|---------|------------|
| Semantic product search | `embeddingModel` in `ai_config`, vector store per tenant |
| “Ask about this product” | Embed `description` + `attributes` + FAQs |
| Storefront chatbot | FAQ RAG + product catalog read APIs; escalate to human support |

**Not a substitute for** keyword search initially — run hybrid (keyword + vector).

---

## 6. Priority Roadmap

### Phase B+ — Quick wins (1–2 sprints)

Reuse existing endpoints and `useAiGenerate`; no new infrastructure.

| # | Feature | Surface | Effort |
|---|---------|---------|--------|
| 1 | Category description assist | `CategoryForm` | ✅ Done |
| 2 | Brand description assist | `BrandForm` | ✅ Done |
| 3 | Page block content assist | `SimpleContentEditor` | ✅ Done |
| 4 | AI Studio: FAQ + page SEO tabs | `AiStudio.tsx` | S |
| 5 | Review reply draft | `ReviewCard` | S |

### Phase C — ERP integration (3–5 sprints)

| # | Feature | Depends on |
|---|---------|------------|
| 1 | `ai_jobs` + BullMQ processor | Infra |
| 2 | `product.created` → background SEO draft | Events |
| 3 | `cart.abandoned` → message draft | Events + marketing — admin manual draft ✅ at `/admin/carts` |
| 4 | Supplier invoice OCR | File upload + vision model |
| 5 | AR collection email drafts | Finance overdue query |
| 6 | Demand forecasting (read-only) | Reports + historical orders |

### Phase D — Search & copilot (5+ sprints)

| # | Feature |
|---|---------|
| 1 | Embedding pipeline per tenant | ✅ `product_embeddings` + admin reindex |
| 2 | Storefront semantic search API | ✅ Hybrid search on `GET /products?q=` |
| 3 | Admin copilot (read-only tools) | ✅ Dashboard KPI copilot started |
| 4 | Support chat with RAG (FAQ + orders) |
| 5 | Token metering / usage dashboard |

**Effort key:** S = small (< 1 day), M = medium (2–3 days), L = large (1+ week)

---

## 7. What AI Must Never Do

| Action | Reason |
|--------|--------|
| Post or edit journal entries | Financial integrity |
| Adjust inventory quantities | Stock truth is ledger-based |
| Issue refunds or capture payments | Money movement |
| Change prices, discounts, or tax rules | Commercial terms |
| Grant/revoke permissions | Security |
| Cross-tenant data access | Isolation |
| Auto-publish campaigns or products | Draft-and-approve principle |
| Auto-send emails/SMS/push | Compliance and brand risk |

---

## 8. Technical Prerequisites

Before expanding AI beyond inline forms:

| Prerequisite | Status | Needed for |
|--------------|--------|------------|
| `tenants.ai_config` + BYOK | ✅ | Everything |
| `ai:use` permission + plan feature `ai` | ✅ | Everything |
| `useAiGenerate` + `AiInlineBar` | ✅ | New inline surfaces |
| `ai_jobs` table | ⬜ | OCR, bulk, events |
| BullMQ `ai` queue | ⬜ | Async work |
| Domain event hooks | ⬜ | Abandoned cart, product.created |
| Embedding API in `TenantAiClientService` | ✅ | Semantic search |
| Token usage audit log | ⬜ | Billing, quotas |
| `ai:manage` policy UI | ⬜ | Sensitive modules (HRM, finance) |

---

## 9. Success Metrics

Track per tenant after each phase:

| Metric | Target |
|--------|--------|
| Time to publish first product | ↓ 30% with AI assist |
| Campaign creation time | ↓ 25% |
| FAQ coverage (active entries) | ↑ with AI lowering effort |
| Support first-response time | ↓ with suggested replies |
| AI feature adoption (% tenants with `configured: true`) | ↑ via onboarding prompt |
| Token cost per tenant | Visible in future usage dashboard |

---

## Related Documents

| Document | Content |
|----------|---------|
| [ai_system_guide.md](ai_system_guide.md) | A–Z architecture, configuration, APIs, providers, file map |
| [erp_master_system_design.md](erp_master_system_design.md) | ERP Phase 7 AI extension principles |
| [event_driven_architecture.md](../developer/event_driven_architecture.md) | Event hooks for async AI |
| [subscription-and-features.md](subscription-and-features.md) | Plan feature `ai` gating |

---

## Summary

| Layer | Coverage today | Highest-impact next |
|-------|----------------|---------------------|
| **Marketing & content** | ~95% of copy workflows | — |
| **Catalog** | Products, categories, brands | Alt text, bulk import |
| **Support & CRM** | 0% | Suggested chat replies |
| **Operations / inventory** | 100% | Read-only anomaly narratives |
| **Procurement / finance** | 0% | OCR + AR drafts (async) |
| **HRM** | Partial | Job descriptions, screening questions, review phrase bank, payslip explanations |
| **Storefront** | Strong | Semantic search, product Q&A, shopping assistant |
| **Platform infra** | Embeddings + sync API | Jobs queue, metering |

AI should continue to expand **where humans write repetitive text** or **need read-only explanations** — not where the ERP enforces invariants (stock, money, permissions).

---

*Last updated: 2026-06-18 — reflects Phase A/B implementation and platform module inventory.*
