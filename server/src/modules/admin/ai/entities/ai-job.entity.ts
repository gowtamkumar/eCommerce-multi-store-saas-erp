import { AiJobStatus } from '@/common/enums/ai-job-status.enum'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('ai_jobs')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'createdAt'])
export class AiJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string

  @Column({ type: 'varchar', length: 64 })
  type: AiJobType

  @Column({ type: 'varchar', length: 32, default: AiJobStatus.PENDING })
  status: AiJobStatus

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown> | null

  @Column({ type: 'text', nullable: true })
  error: string | null

  @Column({ name: 'total_tokens', type: 'int', default: 0 })
  totalTokens: number

  @Column({ name: 'bull_job_id', type: 'varchar', length: 128, nullable: true })
  bullJobId: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null
}
