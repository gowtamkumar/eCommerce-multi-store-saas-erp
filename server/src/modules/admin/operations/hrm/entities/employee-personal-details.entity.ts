import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { ManyToOne } from 'typeorm'

@Entity('employee_personal_details')
export class EmployeePersonalDetailsEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @OneToOne(() => EmployeeEntity, (employee) => employee.personalDetails)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'date', name: 'dob', nullable: true })
  dob: Date

  @Column({ type: 'varchar', nullable: true })
  gender: string

  @Column({ type: 'varchar', name: 'national_id', nullable: true })
  nationalId: string

  @Column({ type: 'varchar', name: 'passport_no', nullable: true })
  passportNo: string

  @Column({ type: 'jsonb', name: 'emergency_contact', nullable: true })
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }

  @Column({ type: 'varchar', name: 'blood_group', nullable: true })
  bloodGroup: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
