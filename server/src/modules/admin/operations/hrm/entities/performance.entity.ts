import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { EmployeeEntity } from './employee.entity'

@Entity('performance_reviews')
export class PerformanceReviewEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity, (employee) => employee.performanceReviews)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'uuid', name: 'reviewer_id' })
  reviewerId: string

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: EmployeeEntity

  @Column({ name: 'review_period' }) // e.g. "2026-Q1", "2025 Annual"
  reviewPeriod: string

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  score: number // e.g. 1.00 to 5.00

  @Column({ type: 'text', nullable: true })
  comments: string

  @Column({ type: 'jsonb', nullable: true })
  kpi_metrics: {
    metric_name: string
    target: number
    achieved: number
    score: number
  }[]

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
