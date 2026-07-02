import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index, OneToMany } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { PurchaseRequisitionEntity } from './purchase-requisition.entity'
import { QuotationEntity } from './quotation.entity'

export enum RFQStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  AWARDED = 'AWARDED',
  CANCELLED = 'CANCELLED',
}

@Entity('rfqs')
@Index(['storeId', 'status'])
export class RfqEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  rfqNumber: string

  @Column({ type: 'enum', enum: RFQStatus, default: RFQStatus.OPEN })
  status: RFQStatus

  @Column({ type: 'date', name: 'deadline_date' })
  deadlineDate: Date

  @Column({ type: 'uuid', name: 'pr_id', nullable: true })
  prId: string

  @ManyToOne(() => PurchaseRequisitionEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pr_id' })
  purchaseRequisition: PurchaseRequisitionEntity

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

  @OneToMany(() => QuotationEntity, (quotation) => quotation.rfq)
  quotations: QuotationEntity[]
}
