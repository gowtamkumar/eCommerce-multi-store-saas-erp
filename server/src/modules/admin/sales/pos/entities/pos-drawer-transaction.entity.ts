import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PosShiftEntity } from './pos-shift.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

export enum PosDrawerTransactionType {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
}

@Entity('pos_drawer_transactions')
@Index(['storeId', 'shiftId'])
export class PosDrawerTransactionEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'shift_id' })
  shiftId: string

  @ManyToOne(() => PosShiftEntity, (shift) => shift.drawerTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: PosShiftEntity

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: PosDrawerTransactionType

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number

  @Column({ type: 'text', nullable: true })
  reason?: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity
}
