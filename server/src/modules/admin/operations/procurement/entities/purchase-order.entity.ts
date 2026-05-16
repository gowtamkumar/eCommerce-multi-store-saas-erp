import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { SupplierEntity } from './supplier.entity'

export enum POStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

@Entity('purchase_orders')
export class PurchaseOrderEntity extends BaseEntity {
  @Column({ unique: true })
  poNumber: string

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity)
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'uuid', name: 'branch_id' })
  branchId: string

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'date' })
  orderDate: Date

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT
  })
  status: POStatus

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number

  @Column({ type: 'jsonb' })
  items: {
    productId: string
    productName: string
    quantityOrdered: number
    quantityReceived: number
    unitPrice: number
    totalPrice: number
  }[]

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
