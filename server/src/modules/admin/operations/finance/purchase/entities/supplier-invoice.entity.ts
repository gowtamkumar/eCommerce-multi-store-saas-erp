import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { PurchaseOrderEntity } from './purchase-order.entity'
import { SupplierInvoiceItemEntity } from './supplier-invoice-item.entity'

export enum SupplierInvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_MATCH = 'PENDING_MATCH',
  MATCHED = 'MATCHED',
  DISCREPANCY = 'DISCREPANCY',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum ThreeWayMatchStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  DISCREPANCY = 'DISCREPANCY',
}

@Entity('supplier_invoices')
@Index(['storeId', 'status'])
export class SupplierInvoiceEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'uuid', name: 'po_id' })
  purchaseOrderId: string

  @ManyToOne(() => PurchaseOrderEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'po_id' })
  purchaseOrder: PurchaseOrderEntity

  @Column({ type: 'date', name: 'invoice_date' })
  invoiceDate: Date

  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'paid_amount' })
  paidAmount: number

  @Column({ type: 'enum', enum: SupplierInvoiceStatus, default: SupplierInvoiceStatus.DRAFT })
  status: SupplierInvoiceStatus

  @Column({
    type: 'enum',
    enum: ThreeWayMatchStatus,
    default: ThreeWayMatchStatus.PENDING,
    name: 'match_status',
  })
  matchStatus: ThreeWayMatchStatus

  @Column({ type: 'text', nullable: true })
  discrepancyNotes: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'created_by' })
  createdById: string

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @OneToMany(() => SupplierInvoiceItemEntity, (item) => item.supplierInvoice, {
    cascade: true,
  })
  items: SupplierInvoiceItemEntity[]
}
