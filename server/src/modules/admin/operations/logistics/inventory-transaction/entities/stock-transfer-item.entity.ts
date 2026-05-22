import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { StockTransferEntity } from './stock-transfer.entity'

@Entity('stock_transfer_items')
export class StockTransferItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'transfer_id' })
  @Index()
  transferId: string

  @ManyToOne(() => StockTransferEntity, (transfer) => transfer.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transfer_id' })
  transfer: StockTransferEntity

  @Column({ type: 'uuid', name: 'product_id' })
  @Index()
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  @Index()
  variantId: string | null

  @ManyToOne(() => ProductVariantEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity | null

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'quantity_requested' })
  quantityRequested: number

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'quantity_received', default: 0 })
  quantityReceived: number
}
