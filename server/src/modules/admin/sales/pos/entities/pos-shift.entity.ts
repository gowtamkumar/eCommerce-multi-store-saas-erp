import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { PosRegisterEntity } from './pos-register.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { PosDrawerTransactionEntity } from './pos-drawer-transaction.entity'

export enum PosShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('pos_shifts')
@Index(['registerId'])
@Index(['tenantId'])
@Index(['branchId'])
export class PosShiftEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'uuid', name: 'register_id' })
  registerId: string

  @ManyToOne(() => PosRegisterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'register_id' })
  register: PosRegisterEntity

  @Column({ type: 'uuid', name: 'user_id' })
  declare userId: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({
    type: 'enum',
    enum: PosShiftStatus,
    default: PosShiftStatus.OPEN,
  })
  status: PosShiftStatus

  @Column({ type: 'timestamptz', name: 'opening_time', default: () => 'CURRENT_TIMESTAMP' })
  openingTime: Date

  @Column({ type: 'timestamptz', name: 'closing_time', nullable: true })
  closingTime: Date

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'opening_balance' })
  openingBalance: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'closing_balance' })
  closingBalance: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'cash_sales' })
  cashSales: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'card_sales' })
  cardSales: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'mobile_sales' })
  mobileSales: number

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'expected_closing_balance',
  })
  expectedClosingBalance: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'difference' })
  difference: number

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'text', nullable: true })
  remarks: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'cash_in' })
  cashIn: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'cash_out' })
  cashOut: number

  @OneToMany(() => PosDrawerTransactionEntity, (tx) => tx.shift)
  drawerTransactions: PosDrawerTransactionEntity[]
}
