import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { GoodsReceivedNoteEntity } from './grn.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

@Entity('goods_received_note_items')
export class GrnItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'grn_id' })
  grnId: string

  @ManyToOne(() => GoodsReceivedNoteEntity, (grn) => grn.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grn_id' })
  grn: GoodsReceivedNoteEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId: string

  @ManyToOne(() => ProductVariantEntity, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity

  @Column({ type: 'int', name: 'ordered_qty' })
  orderedQty: number

  @Column({ type: 'int', name: 'received_qty' })
  receivedQty: number

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_cost' })
  unitCost: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  condition: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}
