import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { SupplierEntity } from './supplier.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { SupplierAPReferenceType } from '../enums/supplier-ap-Refernce-type.enum'

@Entity('supplier_ap_ledger')
@Index(['storeId', 'supplierId'])
export class SupplierAPLedgerEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({
    type: 'enum',
    enum: SupplierAPReferenceType,
    name: 'reference_type',
  })
  referenceType: SupplierAPReferenceType

  @Column({ type: 'uuid', name: 'reference_id', nullable: true })
  @Index()
  referenceId: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  debit: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  credit: number

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'balance_after', default: 0 })
  balanceAfter: number

  @Column({ type: 'text', nullable: true })
  remarks: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}
