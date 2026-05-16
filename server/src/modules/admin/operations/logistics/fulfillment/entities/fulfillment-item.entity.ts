import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { FulfillmentTaskEntity } from './fulfillment-task.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { WarehouseBinEntity } from '@/modules/system/organization/entities/warehouse-bin.entity'

export enum FulfillmentItemStatus {
  PENDING = 'PENDING',
  PICKED = 'PICKED',
}

@Entity('fulfillment_items')
export class FulfillmentItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'task_id' })
  taskId: string

  @ManyToOne(() => FulfillmentTaskEntity, (task) => task.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: FulfillmentTaskEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId: string

  @ManyToOne(() => ProductVariantEntity)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity

  @Column({ type: 'uuid', name: 'bin_id', nullable: true })
  binId: string

  @ManyToOne(() => WarehouseBinEntity)
  @JoinColumn({ name: 'bin_id' })
  bin: WarehouseBinEntity

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'int', name: 'picked_quantity', default: 0 })
  pickedQuantity: number

  @Column({
    type: 'enum',
    enum: FulfillmentItemStatus,
    default: FulfillmentItemStatus.PENDING,
  })
  status: FulfillmentItemStatus
}
