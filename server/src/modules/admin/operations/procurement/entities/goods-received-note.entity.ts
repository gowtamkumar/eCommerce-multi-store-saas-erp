import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { PurchaseOrderEntity } from './purchase-order.entity'

export enum GRNStatus {
  DRAFT = 'DRAFT',
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED'
}

@Entity('goods_received_notes')
export class GoodsReceivedNoteEntity extends BaseEntity {
  @Column({ unique: true })
  grnNumber: string

  @Column({ type: 'uuid', name: 'po_id' })
  poId: string

  @ManyToOne(() => PurchaseOrderEntity)
  @JoinColumn({ name: 'po_id' })
  purchaseOrder: PurchaseOrderEntity

  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string

  @ManyToOne(() => WarehouseEntity)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @Column({ type: 'date' })
  receivedDate: Date

  @Column({
    type: 'enum',
    enum: GRNStatus,
    default: GRNStatus.DRAFT
  })
  status: GRNStatus

  @Column({ type: 'jsonb' })
  receivedItems: {
    productId: string
    productName: string
    quantityOrdered: number
    quantityReceived: number
    quantityAccepted: number
    quantityRejected: number
    unitPrice: number
    remarks?: string
  }[]

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
