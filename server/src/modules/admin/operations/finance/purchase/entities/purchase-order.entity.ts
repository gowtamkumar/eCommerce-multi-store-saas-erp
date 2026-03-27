import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { PurchaseOrderItemEntity } from '@/modules/admin/operations/finance/purchase/entities/purchase-order-item.entity'
import { SupplierPaymentEntity } from '@/modules/admin/operations/finance/purchase/entities/supplier-payment.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { PurchaseOrderPaymentStatus } from '../enums/purchase-order-payment-status.enum'

@Entity('purchase_orders')
export class PurchaseOrderEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, name: 'reference_number' })
  referenceNumber: string

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number

  @Column({
    type: 'enum',
    enum: PurchaseOrderPaymentStatus,
    default: PurchaseOrderPaymentStatus.PENDING,
    name: 'payment_status',
  })
  paymentStatus: PurchaseOrderPaymentStatus

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'paid_amount' })
  paidAmount: number

  @OneToMany(() => PurchaseOrderItemEntity, (item: PurchaseOrderItemEntity) => item.purchaseOrder, {
    cascade: true,
  })
  items: PurchaseOrderItemEntity[]

  @OneToMany(() => SupplierPaymentEntity, (payment: SupplierPaymentEntity) => payment.purchaseOrder)
  payments: SupplierPaymentEntity[]

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
