import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { BatchStatus } from '@/common/enums/batch-status.enum'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('product_batches')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'productId', 'variantId'])
export class ProductBatchEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, name: 'batch_number' })
  @Index()
  batchNumber: string

  @Column({ type: 'timestamp', name: 'manufacture_date', nullable: true })
  manufactureDate: Date | null

  @Column({ type: 'timestamp', name: 'expiry_date' })
  @Index()
  expiryDate: Date

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'initial_quantity', default: 0 })
  initialQuantity: number

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'current_quantity', default: 0 })
  currentQuantity: number

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.ACTIVE,
  })
  @Index()
  status: BatchStatus

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId: string | null

  @ManyToOne(() => ProductVariantEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity | null

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
