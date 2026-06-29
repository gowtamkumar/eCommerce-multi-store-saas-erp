# Catalog and Content Modules RAG & Embedding Architecture

This document defines the architecture, data flows, and schemas for **Retrieval-Augmented Generation (RAG)** and **Vector Embeddings** across two primary modules:
1. **Catalog Module** (Products, Categories, Brands)
2. **Content Module** (FAQs, Policies)

---

## 1. Architectural Overview

The RAG architecture utilizes a **hybrid search** strategy (lexical SQL `ILIKE` + vector similarity) to retrieve relevant items, which are then injected into LLM prompts as grounding context.

```
                  ┌───────────────────────────────┐
                  │      Shopper / Client Query   │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
    ┌────────────────────────┐      ┌────────────────────────┐
    │     Lexical Search     │      │     Vector Search      │
    │     SQL ILIKE Match    │      │    Cosine Similarity   │
    └────────────┬───────────┘      └────────────┬───────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │      Reciprocal Rank   │
                    │       Fusion (RRF)     │
                    └────────────┬───────────┘
                                 ▼
                    ┌────────────────────────┐
                    │    Context Builder     │
                    │   (Prompt Injection)   │
                    └────────────┬───────────┘
                                 ▼
                    ┌────────────────────────┐
                    │     LLM Generation     │
                    │     (Tenant BYOK)      │
                    └────────────────────────┘
```

---

## 2. Catalog Module RAG & Embedding

The Catalog module enables semantic search and conversational commerce on product variants, categories, and brands.

### 2.1 Product Indexing Schema
* **Target Table**: `product_embeddings`
* **Text Chunk Format**:
  ```
  Product: [Product Name]
  Brand: [Brand Name]
  Category: [Category Name]
  SKU: [SKU]
  Short Description: [Short Description]
  Attributes:
  - [AttributeName]: [AttributeValues]
  Variants:
  - [Combination] — Price: [Price], Status: [StockStatus]
  ```

### 2.2 Category & Brand Redirect RAG
To map query intent to product listing categories:
* **Target Table**: `catalog_metadata_embeddings`
* **Text Chunk Format**:
  ```
  Type: [Category | Brand]
  Name: [Category Name / Brand Name]
  Parent: [Parent Category Name]
  Description: [SEO & Landing page copy]
  ```
* **Use Case**: If a user asks: *"I want to browse baking supplies"*, RAG retrieves the `Baking Accessories` Category Entity ID and returns it as a route link metadata to the frontend.

---

## 3. Content Module RAG & Embedding

The Content module covers store policies, standard FAQs, and support guidelines.

### 3.1 FAQ Indexing Schema
* **Target Table**: `faq_embeddings`
* **Text Chunk Format**:
  ```
  Topic: [FAQ Topic / Tag]
  Question: [FAQ Question]
  Answer: [FAQ Answer stripped of HTML]
  ```

### 3.2 Syncing Pipeline (BullMQ)
FAQ embeddings are computed asynchronously to avoid blocking the admin save action:

```
[Admin Saves FAQ] 
   └── Emit: faq.saved
         └── Queue: BullMQ "ai" queue
               └── Worker: Fetch FAQ -> Create Embedding -> Upsert faq_embeddings
```

---

## 4. Multi-Tenant Security & Isolation

### 4.1 Tenant Gating & Isolation
1. **Row-level isolation**: Every query in the embedding tables **MUST** contain the `tenant_id` filter:
   ```sql
   SELECT * FROM product_embeddings 
   WHERE tenant_id = :tenantId 
   ORDER BY embedding <=> :queryVector LIMIT 5;
   ```
2. **Subscription Gate**: Embedding syncs and storefront search APIs are protected by the `@RequireFeature('ai')` subscription gate.

### 4.2 Cost Containment (BYOK)
* Token calculations for embedding queries (`embeddings/query`) and indexing syncs (`embeddings/sync`) are logged in the `ai_usage_logs` database.
* Quotas are checked prior to triggering batch reindexing to avoid unexpected API bills.
