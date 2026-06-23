import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { ProductEntity } from './product.entity'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'

@Entity('product_variants')
@Index(['sku', 'tenantId'], { unique: true })
@Index(['productId'])
@Index(['tenantId'])
export class ProductVariantEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  sku: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number // Override base price

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'average_cost' })
  averageCost: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'wholesale_price' })
  wholesalePrice: number

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean

  stock: number
  reservedStock: number

  @Column({ type: 'int', default: 5, name: 'low_stock_threshold' })
  lowStockThreshold: number

  @Column({ type: 'simple-array', nullable: true })
  images: string[]

  @Column({ type: 'jsonb' })
  combination: Record<string, string> // e.g., { "Color": "Red", "Size": "XL" }

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weight: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'country_of_origin' })
  countryOfOrigin: string

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'hs_code' })
  hsCode: string

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @OneToMany(() => InventoryLedgerEntity, (ledger) => ledger.variant)
  inventoryLedger: InventoryLedgerEntity[]
}
