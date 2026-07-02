import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { RfqEntity } from './rfq.entity'

export enum QuotationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('quotations')
@Index(['storeId', 'rfqId'])
export class QuotationEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'rfq_id' })
  rfqId: string

  @ManyToOne(() => RfqEntity, (rfq) => rfq.quotations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_id' })
  rfq: RfqEntity

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number

  @Column({ type: 'int', name: 'lead_time_days', default: 0 })
  leadTimeDays: number

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.PENDING })
  status: QuotationStatus

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}
