/**
 * Database Seeder
 * ---------------
 * Seeds essential platform data:
 *   1. Super Admin user
 *   2. Addon Catalog (storage & resource boost addons)
 *   3. Subscription Plans (Starter, Pro Seller, Enterprise)
 *
 * Run once after migrations:
 *   docker compose -f docker-compose.dev.yml exec server npm run seed
 *
 * Super admin credentials are read from env:
 *   SUPER_ADMIN_NAME      (default: "Super Admin")
 *   SUPER_ADMIN_USERNAME  (default: "superadmin")
 *   SUPER_ADMIN_EMAIL     (default: "superadmin@example.com")
 *   SUPER_ADMIN_PASSWORD  (default: "Admin@1234")
 *
 * Safe to re-run — all inserts are idempotent (skipped if already exists).
 */

import 'reflect-metadata'
import { config } from 'dotenv'
import { join } from 'path'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { dataSourceOptions } from './data-source'

// ── Load env ─────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production'
const envFile = isProduction ? '.env.production' : '.env.development'
config({ path: join(process.cwd(), envFile) })

// ── Super admin credentials ───────────────────────────────────────────────────
const SUPER_ADMIN_NAME     = process.env.SUPER_ADMIN_NAME     || 'Super Admin'
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'superadmin'
const SUPER_ADMIN_EMAIL    = process.env.SUPER_ADMIN_EMAIL    || 'superadmin@example.com'
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234'

// ── Addon catalog data ────────────────────────────────────────────────────────
interface AddonSeed {
  slug: string
  name: string
  description: string
  category: 'storage' | 'resource'
  boost_label: string
  boost_value: number
  boost_unit: 'mb' | 'products' | 'orders' | 'staff' | 'locations'
  price: number
  icon: string
  features: string[]
  sort_order: number
}

const ADDON_CATALOG: AddonSeed[] = [
  // ── Storage Addons ──────────────────────────────────────────────────────────
  {
    slug: 'addon_storage_5gb',
    name: 'Lite Storage Boost',
    description: 'Perfect for small stores uploading standard product photos and documents.',
    category: 'storage',
    boost_label: '+5 GB',
    boost_value: 5120,
    boost_unit: 'mb',
    price: 5,
    icon: 'HardDrive',
    features: [
      '5,120 MB Storage Space',
      'High-speed MinIO hosting',
      'Instant activation',
      'Cancel anytime',
    ],
    sort_order: 1,
  },
  {
    slug: 'addon_storage_10gb',
    name: 'Growth Storage Boost',
    description: 'Ideal for growing businesses with rich catalogs and product collections.',
    category: 'storage',
    boost_label: '+10 GB',
    boost_value: 10240,
    boost_unit: 'mb',
    price: 9,
    icon: 'HardDrive',
    features: [
      '10,240 MB Storage Space',
      'High-speed MinIO hosting',
      'Instant activation',
      'Cancel anytime',
    ],
    sort_order: 2,
  },
  {
    slug: 'addon_storage_20gb',
    name: 'Pro Storage Boost',
    description: 'Designed for large retailers with thousands of high-res photos and receipts.',
    category: 'storage',
    boost_label: '+20 GB',
    boost_value: 20480,
    boost_unit: 'mb',
    price: 15,
    icon: 'HardDrive',
    features: [
      '20,480 MB Storage Space',
      'High-speed MinIO hosting',
      'Instant activation',
      'Cancel anytime',
    ],
    sort_order: 3,
  },
  // ── Resource Addons ─────────────────────────────────────────────────────────
  {
    slug: 'addon_products_1000',
    name: 'Catalog Boost',
    description: 'Expand your catalog capacity by adding 1,000 more products and variations.',
    category: 'resource',
    boost_label: '+1,000 SKUs',
    boost_value: 1000,
    boost_unit: 'products',
    price: 15,
    icon: 'Package',
    features: [
      '1,000 product capability',
      'Immediate synchronization',
      'Plan-independent override',
      'One-off activation',
    ],
    sort_order: 4,
  },
  {
    slug: 'addon_orders_5000',
    name: 'Transactions Boost',
    description: 'Increase monthly order limits by 5,000/mo to handle sales spikes and campaigns.',
    category: 'resource',
    boost_label: '+5,000 Orders',
    boost_value: 5000,
    boost_unit: 'orders',
    price: 25,
    icon: 'ShoppingCart',
    features: [
      '5,000 extra monthly orders',
      'Dynamic threshold update',
      'Prevents checkout locks',
      'One-off activation',
    ],
    sort_order: 5,
  },
  {
    slug: 'addon_staff_10',
    name: 'Collaborators Boost',
    description: 'Invite up to 10 additional staff members, managers, or warehouse assistants.',
    category: 'resource',
    boost_label: '+10 Staff',
    boost_value: 10,
    boost_unit: 'staff',
    price: 20,
    icon: 'Users',
    features: [
      '10 team accounts',
      'Granular role assignments',
      'Global branch scoping',
      'One-off activation',
    ],
    sort_order: 6,
  },
  {
    slug: 'addon_locations_3',
    name: 'Logistics Expansion Boost',
    description: 'Add 3 branches and 3 warehouses to expand physical operations and supply chain.',
    category: 'resource',
    boost_label: '+3 Loc / WH',
    boost_value: 3,
    boost_unit: 'locations',
    price: 35,
    icon: 'MapPin',
    features: [
      '3 physical branches',
      '3 warehouse inventories',
      'Multi-source stock routing',
      'One-off activation',
    ],
    sort_order: 7,
  },
]

// ── Subscription plans data ───────────────────────────────────────────────────
interface PlanSeed {
  code: string
  name: string
  description: string
  price: number
  monthly_price: number
  yearly_price: number
  is_popular: boolean
  trial_period_days: number
  currency: string
  max_branches: number
  max_warehouses: number
  max_staff_users: number
  max_products: number
  max_monthly_orders: number
  max_storage_mb: number
  features: string[]
}

const PLANS_TO_SEED: PlanSeed[] = [
  {
    code: 'starter',
    name: 'Starter',
    description: 'Basic storefront configuration and single-location catalog.',
    price: 0,
    monthly_price: 0,
    yearly_price: 0,
    is_popular: false,
    trial_period_days: 14,
    currency: 'USD',
    max_branches: 1,
    max_warehouses: 1,
    max_staff_users: 3,
    max_products: 100,
    max_monthly_orders: 500,
    max_storage_mb: 1024,
    features: ['pos', 'catalog', 'content', 'settings', 'payment_settings', 'courier', 'ai', 'reports'],
  },
  {
    code: 'pro_seller',
    name: 'Pro Seller',
    description: 'The essentials to get your store up and running with professional features.',
    price: 29,
    monthly_price: 29,
    yearly_price: 290,
    is_popular: true,
    trial_period_days: 14,
    currency: 'USD',
    max_branches: 3,
    max_warehouses: 3,
    max_staff_users: 10,
    max_products: 1000,
    max_monthly_orders: 5000,
    max_storage_mb: 5120,
    features: [
      'pos', 'catalog', 'content', 'settings', 'payment_settings', 'courier',
      'orders', 'marketing', 'seo', 'trust_safety', 'email', 'sms',
      'currencies', 'custom_domain', 'header', 'footer',
      'product_list_ui', 'product_detail_ui', 'offers_page_ui',
      'inventory', 'ai', 'reports',
    ],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    description: 'Scale your business with dedicated support and advanced infrastructure.',
    price: 99,
    monthly_price: 99,
    yearly_price: 990,
    is_popular: false,
    trial_period_days: 30,
    currency: 'USD',
    max_branches: 10,
    max_warehouses: 10,
    max_staff_users: 50,
    max_products: 10000,
    max_monthly_orders: 50000,
    max_storage_mb: 20480,
    features: [
      'pos', 'catalog', 'content', 'settings', 'payment_settings', 'courier',
      'orders', 'marketing', 'seo', 'trust_safety', 'email', 'sms',
      'currencies', 'custom_domain', 'header', 'footer',
      'product_list_ui', 'product_detail_ui', 'offers_page_ui',
      'organization', 'finance', 'hrm', 'reports',
      'logistics', 'branding', 'inventory', 'purchasing', 'ai',
    ],
  },
]

// ── Logger helpers ────────────────────────────────────────────────────────────
const log  = (msg: string) => console.log(`\x1b[36m[Seeder]\x1b[0m ${msg}`)
const ok   = (msg: string) => console.log(`\x1b[32m[Seeder] ✔\x1b[0m ${msg}`)
const warn = (msg: string) => console.warn(`\x1b[33m[Seeder] ⚠\x1b[0m ${msg}`)
const fail = (msg: string, e?: unknown) => { console.error(`\x1b[31m[Seeder] ✖\x1b[0m ${msg}`, e ?? ''); process.exit(1) }

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  log('Connecting to database…')
  const dataSource = new DataSource({
    ...dataSourceOptions,
    migrationsRun: false,
    synchronize:   false,
    logging:       false,
  })
  await dataSource.initialize()
  log('Connection established.')

  try {
    // ── 1. Super Admin ────────────────────────────────────────────────────────
    log('──────────────────────────────────────────')
    log('Section 1: Super Admin')
    log('──────────────────────────────────────────')

    const existing = await dataSource.query<{ id: string }[]>(
      `SELECT id FROM "users" WHERE email = $1 AND role = 'super_admin' LIMIT 1`,
      [SUPER_ADMIN_EMAIL],
    )

    if (existing.length > 0) {
      warn(`Super admin already exists (id: ${existing[0].id}). Skipping.`)
    } else {
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12)
      await dataSource.query(
        `INSERT INTO "users" (
           id, name, username, email, password, role, status,
           is_admin, is_email_verified,
           store_id, credit_limit, credit_hold,
           membership_tier, loyalty_points_balance,
           created_at, updated_at
         ) VALUES (
           uuid_generate_v4(), $1, $2, $3, $4, 'super_admin', 'active',
           true, true,
           NULL, 0, false,
           'BRONZE', 0,
           now(), now()
         )`,
        [SUPER_ADMIN_NAME, SUPER_ADMIN_USERNAME, SUPER_ADMIN_EMAIL, hashedPassword],
      )
      ok(`Super admin created!`)
      ok(`  Name     : ${SUPER_ADMIN_NAME}`)
      ok(`  Username : ${SUPER_ADMIN_USERNAME}`)
      ok(`  Email    : ${SUPER_ADMIN_EMAIL}`)
      ok(`  Password : ${SUPER_ADMIN_PASSWORD}`)
    }

    // ── 2. Addon Catalog ──────────────────────────────────────────────────────
    log('──────────────────────────────────────────')
    log('Section 2: Addon Catalog')
    log('──────────────────────────────────────────')

    let created = 0
    let skipped = 0

    for (const addon of ADDON_CATALOG) {
      const rows = await dataSource.query<{ id: string }[]>(
        `SELECT id FROM "addon_catalog" WHERE slug = $1 LIMIT 1`,
        [addon.slug],
      )

      if (rows.length > 0) {
        warn(`Addon "${addon.slug}" already exists. Skipping.`)
        skipped++
        continue
      }

      await dataSource.query(
        `INSERT INTO "addon_catalog" (
           id, slug, name, description, category,
           boost_label, boost_value, boost_unit,
           price, icon, features, is_active, sort_order,
           created_at, updated_at
         ) VALUES (
           uuid_generate_v4(), $1, $2, $3, $4,
           $5, $6, $7,
           $8, $9, $10, true, $11,
           now(), now()
         )`,
        [
          addon.slug,
          addon.name,
          addon.description,
          addon.category,
          addon.boost_label,
          addon.boost_value,
          addon.boost_unit,
          addon.price,
          addon.icon,
          JSON.stringify(addon.features),
          addon.sort_order,
        ],
      )
      ok(`Addon created: ${addon.name} (${addon.boost_label}) — $${addon.price}`)
      created++
    }

    log(`Addon catalog: ${created} created, ${skipped} skipped.`)

    // ── 3. Subscription Plans ─────────────────────────────────────────────────
    log('──────────────────────────────────────────')
    log('Section 3: Subscription Plans')
    log('──────────────────────────────────────────')

    let plansCreated = 0
    let plansSkipped = 0

    for (const plan of PLANS_TO_SEED) {
      const planRows = await dataSource.query<{ id: string }[]>(
        `SELECT id FROM "subscription_plans" WHERE code = $1 LIMIT 1`,
        [plan.code],
      )

      if (planRows.length > 0) {
        warn(`Plan "${plan.code}" already exists. Skipping.`)
        plansSkipped++
        continue
      }

      await dataSource.query(
        `INSERT INTO "subscription_plans" (
           id, name, description,
           price, monthly_price, yearly_price,
           billing_cycle, features,
           is_active, is_popular, trial_period_days,
           code, currency,
           max_branches, max_warehouses, max_staff_users,
           max_products, max_monthly_orders, max_storage_mb,
           created_at, updated_at
         ) VALUES (
           uuid_generate_v4(), $1, $2,
           $3, $4, $5,
           'monthly', $6,
           true, $7, $8,
           $9, $10,
           $11, $12, $13,
           $14, $15, $16,
           now(), now()
         )`,
        [
          plan.name,
          plan.description,
          plan.price,
          plan.monthly_price,
          plan.yearly_price,
          JSON.stringify(plan.features),
          plan.is_popular,
          plan.trial_period_days,
          plan.code,
          plan.currency,
          plan.max_branches,
          plan.max_warehouses,
          plan.max_staff_users,
          plan.max_products,
          plan.max_monthly_orders,
          plan.max_storage_mb,
        ],
      )
      ok(`Plan created: ${plan.name} — $${plan.monthly_price}/mo · $${plan.yearly_price}/yr`)
      plansCreated++
    }

    log(`Subscription plans: ${plansCreated} created, ${plansSkipped} skipped.`)
    log('──────────────────────────────────────────')
    log('Seeding complete. ✓')
  } catch (e) {
    fail('Seeding failed:', e)
  } finally {
    await dataSource.destroy()
  }
}

seed()
