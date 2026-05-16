import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('attendance_events')
export class AttendanceEventEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'varchar', name: 'event_type' }) // CLOCK_IN, CLOCK_OUT
  eventType: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date

  @Column({ type: 'varchar', nullable: true })
  source: string // POS, Mobile, Web

  @Column({ type: 'varchar', name: 'device_id', nullable: true })
  deviceId: string

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress: string

  @Column({ type: 'decimal', name: 'gps_lat', precision: 10, scale: 7, nullable: true })
  gpsLat: number

  @Column({ type: 'decimal', name: 'gps_long', precision: 10, scale: 7, nullable: true })
  gpsLong: number

  @Column({ type: 'varchar', name: 'photo_url', nullable: true })
  photoUrl: string

  @Column({ type: 'varchar', name: 'verification_status', default: 'PENDING' })
  verificationStatus: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
