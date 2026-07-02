import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { AttendanceStatus } from '@/common/enums/hrm/hrm-enums'

@Entity('attendance_sessions')
@Index(['storeId'])
@Index(['employeeId'])
@Index(['branchId'])
export class AttendanceSessionEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'timestamp', name: 'clock_in' })
  checkIn: Date

  @Column({ type: 'timestamp', name: 'clock_out', nullable: true })
  checkOut: Date

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
