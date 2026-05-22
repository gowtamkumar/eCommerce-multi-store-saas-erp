import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PosShiftEntity } from './pos-shift.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

export enum PosDrawerTransactionType {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
}

@Entity('pos_drawer_transactions')
@Index(['tenantId', 'shiftId'])
export class PosDrawerTransactionEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

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
