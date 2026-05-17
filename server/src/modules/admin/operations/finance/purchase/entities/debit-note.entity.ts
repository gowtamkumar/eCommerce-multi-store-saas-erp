import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { PurchaseOrderEntity } from './purchase-order.entity'

export enum DebitNoteStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
}

@Entity('debit_notes')
@Index(['tenantId', 'status'])
export class DebitNoteEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  debitNoteNumber: string

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'uuid', name: 'po_id', nullable: true })
  purchaseOrderId: string

  @ManyToOne(() => PurchaseOrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'po_id' })
  purchaseOrder: PurchaseOrderEntity

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number

  @Column({ type: 'text', nullable: true })
  reason: string

  @Column({ type: 'enum', enum: DebitNoteStatus, default: DebitNoteStatus.DRAFT })
  status: DebitNoteStatus

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'created_by' })
  createdById: string

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity
}
