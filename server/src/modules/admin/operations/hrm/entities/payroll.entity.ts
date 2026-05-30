import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { PayrollBatchStatus } from '@/common/enums/hrm/hrm-enums'

@Entity('payroll_batches')
@Index(['tenantId', 'period'])
export class PayrollBatchEntity extends BaseEntity {
  @Column()
  name: string // e.g. "May 2026 Payroll"

  @Column()
  period: string // e.g. "2026-05"

  @Column({ type: 'decimal', name: 'total_amount', precision: 15, scale: 2, default: 0 })
  totalAmount: number

  @Column({
    type: 'enum',
    enum: PayrollBatchStatus,
    default: PayrollBatchStatus.DRAFT,
  })
  status: PayrollBatchStatus

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'journal_entry_id', nullable: true })
  journalEntryId: string

  @Column({ type: 'uuid', name: 'approved_by_id', nullable: true })
  approvedById: string | null

  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt: Date | null

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt: Date | null

  @OneToMany(() => PayrollSlipEntity, (slip) => slip.batch)
  slips: PayrollSlipEntity[]
}

@Entity('payroll_slips')
export class PayrollSlipEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'batch_id' })
  batchId: string

  @ManyToOne(() => PayrollBatchEntity, (batch) => batch.slips)
  @JoinColumn({ name: 'batch_id' })
  batch: PayrollBatchEntity

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'decimal', name: 'basic_salary', precision: 12, scale: 2 })
  basicSalary: number

  @Column({ type: 'decimal', name: 'total_allowances', precision: 12, scale: 2, default: 0 })
  totalAllowances: number

  @Column({ type: 'decimal', name: 'total_deductions', precision: 12, scale: 2, default: 0 })
  totalDeductions: number

  @Column({ type: 'decimal', name: 'net_salary', precision: 12, scale: 2 })
  netSalary: number

  @Column({ type: 'jsonb', name: 'details' })
  details: {
    allowances: { type: string; amount: number }[]
    deductions: { type: string; amount: number }[]
    overtimePay: number
    leaveDeductions: number
    lateDeductions?: number
    incomeTax?: number
    overtimeHours?: number
    lateMinutes?: number
    unpaidLeaveDays?: number
    unpaidAbsenceDays?: number
    inactiveDays?: number
    holidayDays?: number
    weeklyOffDays?: number
    activeDays?: number
    workingDays?: number
    unpaidLeaveDeductions?: number
    unpaidAbsenceDeductions?: number
    inactiveDeductions?: number
  }

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
