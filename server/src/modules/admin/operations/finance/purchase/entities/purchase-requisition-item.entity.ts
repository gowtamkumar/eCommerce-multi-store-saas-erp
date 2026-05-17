import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PurchaseRequisitionEntity } from './purchase-requisition.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
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

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
