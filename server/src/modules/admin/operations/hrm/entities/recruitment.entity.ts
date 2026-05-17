import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { DepartmentEntity } from './department.entity'
import { EmployeeEntity } from './employee.entity'
import { JobStatus, ApplicantStatus } from '@/common/enums/hrm/hrm-enums'

@Entity('job_postings')
export class JobPostingEntity extends BaseEntity {
  @Column()
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'json', nullable: true })
  requirements: string[]

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string

  @ManyToOne(() => DepartmentEntity)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity

  @Column({ type: 'varchar', nullable: true })
  location: string

  @Column({ type: 'decimal', name: 'salary_range_min', precision: 12, scale: 2, nullable: true })
  salaryRangeMin: number

  @Column({ type: 'decimal', name: 'salary_range_max', precision: 12, scale: 2, nullable: true })
  salaryRangeMax: number

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => ApplicantEntity, (applicant) => applicant.jobPosting)
  applicants: ApplicantEntity[]
}

@Entity('applicants')
export class ApplicantEntity extends BaseEntity {
  @Column({ name: 'first_name', nullable: true })
  firstName: string

  @Column({ name: 'last_name', nullable: true })
  lastName: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ type: 'text', name: 'resume_url', nullable: true })
  resumeUrl: string

  @Column({ type: 'uuid', name: 'job_posting_id' })
  jobPostingId: string

  @ManyToOne(() => JobPostingEntity, (job) => job.applicants)
  @JoinColumn({ name: 'job_posting_id' })
  jobPosting: JobPostingEntity

  @Column({ type: 'enum', enum: ApplicantStatus, default: ApplicantStatus.APPLIED })
  status: ApplicantStatus

  @Column({ type: 'varchar', nullable: true })
  source: string // LinkedIn, Referral, etc.

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => InterviewEntity, (interview) => interview.applicant)
  interviews: InterviewEntity[]
}

@Entity('interviews')
export class InterviewEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'applicant_id' })
  applicantId: string

  @ManyToOne(() => ApplicantEntity, (applicant) => applicant.interviews)
  @JoinColumn({ name: 'applicant_id' })
  applicant: ApplicantEntity

  @Column({ type: 'uuid', name: 'interviewer_id' })
  interviewerId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'interviewer_id' })
  interviewer: EmployeeEntity

  @Column({ type: 'timestamp', name: 'scheduled_at' })
  scheduledAt: Date

  @Column({ type: 'text', nullable: true })
  feedback: string

  @Column({ type: 'int', nullable: true })
  score: number // 1-10

  @Column({ type: 'varchar', default: 'SCHEDULED' })
  status: string // SCHEDULED, COMPLETED, CANCELLED

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
