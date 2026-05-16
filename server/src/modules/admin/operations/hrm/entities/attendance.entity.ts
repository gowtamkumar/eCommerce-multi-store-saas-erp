import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { AttendanceStatus } from '@/common/enums/hrm/hrm-enums'

@Entity('attendance_sessions')
export class AttendanceSessionEntity extends BaseEntity {
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

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string

  @Column({ type: 'timestamp', name: 'clock_in' })
  clockIn: Date

  @Column({ type: 'timestamp', name: 'clock_out', nullable: true })
  clockOut: Date

  @Column({ type: 'decimal', name: 'work_hours', precision: 5, scale: 2, default: 0 })
  workHours: number

  @Column({ type: 'decimal', name: 'overtime_hours', precision: 5, scale: 2, default: 0 })
  overtimeHours: number

  @Column({ type: 'int', name: 'late_minutes', default: 0 })
  lateMinutes: number

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus

  @Column({ type: 'text', nullable: true })
  note: string
}
