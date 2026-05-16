import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { LeaveType, LeaveStatus } from '@/common/enums/hrm/hrm-enums'

@Entity('leave_quotas')
export class LeaveQuotaEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType

  @Column({ type: 'int', default: 0 })
  totalDays: number

  @Column({ type: 'int', default: 0 })
  usedDays: number

  @Column({ type: 'int' })
  year: number
}

@Entity('leave_requests')
export class LeaveRequestEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date

  @Column({ type: 'int', name: 'total_days' })
  totalDays: number

  @Column({ type: 'text' })
  reason: string

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus

  @Column({ type: 'uuid', name: 'approved_by_id', nullable: true })
  approvedById: string

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: EmployeeEntity

  @Column({ type: 'text', name: 'manager_note', nullable: true })
  managerNote: string
}
