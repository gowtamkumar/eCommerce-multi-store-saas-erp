import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { EmployeeEntity } from './employee.entity'

@Entity('shifts')
export class ShiftEntity extends BaseEntity {
  @Column()
  name: string // e.g. "Morning Shift", "Night Shift"

  @Column({ type: 'time', name: 'start_time' })
  startTime: string

  @Column({ type: 'time', name: 'end_time' })
  endTime: string

  @Column({ type: 'int', name: 'grace_minutes', default: 15 })
  graceMinutes: number

  @Column({ type: 'boolean', name: 'is_night_shift', default: false })
  isNightShift: boolean

  /**
   * Weekly working days, 0=Sun … 6=Sat. Defaults to Mon-Fri (1-5).
   * Days NOT listed are treated as weekly-off and excluded from
   * unpaid-absence and lateness calculations.
   */
  @Column({ type: 'int', array: true, name: 'working_days', default: '{1,2,3,4,5}' })
  workingDays: number[]

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}

@Entity('employee_shift_assignments')
export class EmployeeShiftAssignmentEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'uuid', name: 'shift_id' })
  shiftId: string

  @ManyToOne(() => ShiftEntity)
  @JoinColumn({ name: 'shift_id' })
  shift: ShiftEntity

  @Column({ type: 'date', name: 'effective_from' })
  effectiveFrom: Date

  @Column({ type: 'date', name: 'effective_to', nullable: true })
  effectiveTo: Date

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
