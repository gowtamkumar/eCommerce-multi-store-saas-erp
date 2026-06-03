import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * Superadmin-managed catalog of purchasable addon boosts.
 * Each row defines one addon type (e.g. +5 GB Storage, +1000 SKUs).
 * Tenants purchase these via /billing/purchase-addon using the slug.
 *
 * boost_unit controls how the backend enforces limits:
 *   'mb'        → adds boost_value MB to storage cap
 *   'products'  → adds boost_value to max products
 *   'orders'    → adds boost_value to monthly order limit
 *   'staff'     → adds boost_value to max staff users
 *   'locations' → adds boost_value to max branches AND warehouses
 */
@Entity('addon_catalog')
@Index(['slug'], { unique: true })
export class AddonCatalogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Unique machine-readable slug, e.g. addon_storage_5gb */
  @Column({ type: 'varchar', length: 100 })
  slug: string

  /** Human-readable display name, e.g. "Lite Storage Boost" */
  @Column({ type: 'varchar', length: 200 })
  name: string

  /** Short description shown on the billing page */
  @Column({ type: 'text', nullable: true })
  description: string

  /** UI grouping: 'storage' | 'resource' */
  @Column({ type: 'varchar', length: 50, default: 'resource' })
  category: string

  /** Display label for the boost, e.g. "+5 GB Storage" */
  @Column({ type: 'varchar', length: 100, name: 'boost_label' })
  boostLabel: string

  /** Numeric amount of the boost (e.g. 5120 for MB, 1000 for products) */
  @Column({ type: 'int', name: 'boost_value' })
  boostValue: number

  /**
   * Unit of the boost — drives server-side enforcement logic.
   * Allowed: 'mb' | 'products' | 'orders' | 'staff' | 'locations'
   */
  @Column({ type: 'varchar', length: 50, name: 'boost_unit' })
  boostUnit: string

  /** One-off price in USD */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number

  /** Lucide React icon name, e.g. "HardDrive", "Package" */
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string

  /** Bullet-point features shown on the addon card (stored as JSON array) */
  @Column({ type: 'jsonb', default: [] })
  features: string[]

  /** Whether this addon is available for purchase */
  @Column({ name: 'is_active', default: true })
  isActive: boolean

  /** Controls display order in the billing UI */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
