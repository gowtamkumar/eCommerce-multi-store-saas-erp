import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { DepartmentEntity } from './department.entity'
import { DesignationEntity } from './designation.entity'
import { EmployeePersonalDetailsEntity } from './employee-personal-details.entity'
import { EmployeeDocumentEntity } from './employee-document.entity'
import { EmployeeStatus, ContractType } from '@/common/enums/hrm/hrm-enums'
import { PerformanceReviewEntity } from './performance.entity'

@Entity('employees')
export class EmployeeEntity extends BaseEntity {
  @Column({ name: 'employee_id', unique: true, nullable: true })
  employeeId: string

  @OneToOne(() => UserEntity, (user) => user.employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @OneToOne(() => EmployeePersonalDetailsEntity, (pd) => pd.employee, { cascade: true })
  personalDetails: EmployeePersonalDetailsEntity

  @OneToMany(() => EmployeeDocumentEntity, (doc) => doc.employee)
  documents: EmployeeDocumentEntity[]

  @OneToMany(() => PerformanceReviewEntity, (review) => review.employee)
  performanceReviews: PerformanceReviewEntity[]

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string

  @ManyToOne(() => DepartmentEntity)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity

  @Column({ type: 'uuid', name: 'designation_id', nullable: true })
  designationId: string

  @ManyToOne(() => DesignationEntity)
  @JoinColumn({ name: 'designation_id' })
  designation: DesignationEntity

  @Column({ type: 'uuid', name: 'manager_id', nullable: true })
  managerId: string

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: EmployeeEntity

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.PROBATION,
  })
  status: EmployeeStatus

  @Column({
    type: 'enum',
    enum: ContractType,
    default: ContractType.FULL_TIME,
  })
  contractType: ContractType

  @Column({ type: 'jsonb', name: 'salary_config', nullable: true })
  salaryConfig: {
    basicSalary: number
    allowances?: { type: string; amount: number }[]
    deductions?: { type: string; amount: number }[]
  }

  @Column({ type: 'date', name: 'joining_date' })
  joiningDate: Date

  @Column({ type: 'date', name: 'exit_date', nullable: true })
  exitDate: Date
}
