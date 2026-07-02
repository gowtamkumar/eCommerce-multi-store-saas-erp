import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index, OneToMany } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { PurchaseRequisitionItemEntity } from './purchase-requisition-item.entity'

export enum PRStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PO_CREATED = 'PO_CREATED',
}

@Entity('purchase_requisitions')
@Index(['storeId', 'status'])
export class PurchaseRequisitionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  prNumber: string

  @Column({ type: 'enum', enum: PRStatus, default: PRStatus.DRAFT })
  status: PRStatus

  @Column({ type: 'text', nullable: true })
  justification: string

  @Column({ type: 'date', name: 'required_date' })
  requiredDate: Date

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'requested_by' })
  requestedById: string

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: UserEntity

  @Column({ type: 'uuid', name: 'approved_by', nullable: true })
  approvedById: string

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: UserEntity

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: true })
  warehouseId: string

  @ManyToOne(() => WarehouseEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @OneToMany(() => PurchaseRequisitionItemEntity, (item) => item.purchaseRequisition, {
    cascade: true,
  })
  items: PurchaseRequisitionItemEntity[]
}
