import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('ai_usage_logs')
@Index(['storeId', 'createdAt'])
export class AiUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string

  @Column({ type: 'varchar', length: 128 })
  endpoint: string

  @Column({ type: 'varchar', length: 32 })
  operation: string

  @Column({ type: 'varchar', length: 128 })
  model: string

  @Column({ name: 'prompt_tokens', type: 'int', default: 0 })
  promptTokens: number

  @Column({ name: 'completion_tokens', type: 'int', default: 0 })
  completionTokens: number

  @Column({ name: 'total_tokens', type: 'int', default: 0 })
  totalTokens: number

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date
}
