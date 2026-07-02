import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PurchaseRequisitionEntity } from './purchase-requisition.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'

@Entity('purchase_requisition_items')
export class PurchaseRequisitionItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'pr_id' })
  prId: string

  @ManyToOne(() => PurchaseRequisitionEntity, (pr) => pr.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pr_id' })
  purchaseRequisition: PurchaseRequisitionEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}
