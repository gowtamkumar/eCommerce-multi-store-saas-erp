# Database Setup Guide

Complete guide for setting up the database from scratch using Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + NestJS |
| Database | PostgreSQL |
| ORM | TypeORM |
| Storage | MinIO |
| Cache | Redis |
| Container | Docker + Docker Compose |

---

## Quick Start (First-Time Setup)

Run these 3 commands **in order** from the project root:

```bash
# Step 1 — Start all containers (postgres, redis, minio, server)
docker compose -f docker-compose.dev.yml up -d

# Step 2 — Build the full database schema (runs InitialSchema migration)
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:run

# Step 3 — Seed essential platform data (super admin + addons + plans)
docker compose -f docker-compose.dev.yml exec server npm run seed
```

That's it. The platform is ready. ✓

---

## What Each Step Does

### Step 1 — `up -d`

Starts all Docker services in detached (background) mode:

| Container | Purpose | Port |
|---|---|---|
| `multi_store_postgres_db_dev` | PostgreSQL database | `5432` |
| `multi_store_redis_dev` | Redis cache & queues | `6379` |
| `multi_store_minio_dev` | MinIO object storage | `9000` / `9001` |
| `multi_store_server_dev` | NestJS API server | `3900` |

---

### Step 2 — `migration:run`

Applies all pending TypeORM migration files from `server/src/database/migrations/`.

Currently runs **one clean migration**:

| Migration File | What it creates |
|---|---|
| `1782972825562-InitialSchema.ts` | All tables, indexes, enums, foreign keys |

**Tables created include:** `stores`, `users`, `products`, `orders`, `warehouses`, `branches`, `subscription_plans`, `addon_catalog`, `ai_jobs`, `pos_registers`, `roles`, `permissions`, and many more.

> **Note:** `DB_MIGRATIONS_RUN=true` in `.env.development` means migrations also auto-run on server boot. Running this command manually is only needed on first setup or after adding new migration files.

---

### Step 3 — `seed`

Inserts essential platform data. **Safe to re-run** — all operations are idempotent (existing records are skipped, never duplicated).

#### Section 1 — Super Admin

Creates the platform owner account using credentials from `.env.development`:

| Variable | Default | Current Value |
|---|---|---|
| `SUPER_ADMIN_NAME` | `Super Admin` | `Super Admin` |
| `SUPER_ADMIN_USERNAME` | `superadmin` | `superadmin` |
| `SUPER_ADMIN_EMAIL` | `superadmin@example.com` | `superadmin@gmail.com` |
| `SUPER_ADMIN_PASSWORD` | `Admin@1234` | *(set in .env)* |

#### Section 2 — Addon Catalog (7 addons)

| Slug | Name | Boost | Price |
|---|---|---|---|
| `addon_storage_5gb` | Lite Storage Boost | +5 GB | $5 |
| `addon_storage_10gb` | Growth Storage Boost | +10 GB | $9 |
| `addon_storage_20gb` | Pro Storage Boost | +20 GB | $15 |
| `addon_products_1000` | Catalog Boost | +1,000 SKUs | $15 |
| `addon_orders_5000` | Transactions Boost | +5,000 Orders | $25 |
| `addon_staff_10` | Collaborators Boost | +10 Staff | $20 |
| `addon_locations_3` | Logistics Expansion Boost | +3 Loc / WH | $35 |

#### Section 3 — Subscription Plans (3 plans)

| Plan | Monthly | Yearly | Trial | Products | Orders/mo | Storage |
|---|---|---|---|---|---|---|
| Starter | Free | Free | 14 days | 100 | 500 | 1 GB |
| Pro Seller ⭐ | $29 | $290 | 14 days | 1,000 | 5,000 | 5 GB |
| Enterprise | $99 | $990 | 30 days | 10,000 | 50,000 | 20 GB |

---

## Migration Commands Reference

```bash
# Check which migrations have run ([ ] = pending, [X] = applied)
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:show

# Apply all pending migrations
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:run

# Revert the last applied migration
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:revert

# Generate a new migration from entity changes (replace <MigrationName>)
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:generate src/database/migrations/<MigrationName>

# Create an empty migration file to write manually
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:create src/database/migrations/<MigrationName>
```

---

## Seed Command Reference

```bash
# Run the seeder (idempotent — safe to run multiple times)
docker compose -f docker-compose.dev.yml exec server npm run seed
```

Seeder file: [`server/src/database/seed.ts`](./server/src/database/seed.ts)

---

## Full Reset (Start Over)

Use this to completely wipe and rebuild the database from scratch:

```bash
# Drop all tables and enums
docker compose -f docker-compose.dev.yml exec server npm run typeorm schema:drop

# Re-run migrations to rebuild schema
docker compose -f docker-compose.dev.yml exec server npm run typeorm migration:run

# Re-seed platform data
docker compose -f docker-compose.dev.yml exec server npm run seed
```

---

## Environment Configuration

Key database variables in `server/.env.development`:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=multi_store_ecommerce
DB_SYNCHRONIZE=false          # Never set to true in production
DB_MIGRATIONS_RUN=true        # Auto-run migrations on server boot

# Super Admin Seed Credentials
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_EMAIL=superadmin@gmail.com
SUPER_ADMIN_PASSWORD=SecurePassword123!
```

> ⚠️ **Never set `DB_SYNCHRONIZE=true` in production.** Always use migrations.

---

## Migration File Location

```
server/
└── src/
    └── database/
        ├── data-source.ts          ← TypeORM DataSource config
        ├── seed.ts                 ← Platform data seeder
        └── migrations/
            └── 1782972825562-InitialSchema.ts  ← Single clean baseline migration
```
