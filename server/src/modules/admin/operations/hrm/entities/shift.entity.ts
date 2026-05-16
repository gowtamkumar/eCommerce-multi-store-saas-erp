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
