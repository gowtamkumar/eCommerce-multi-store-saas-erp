import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'

@Entity('accounting_outbox')
@Index(['status', 'createdAt'])
@Index(['storeId', 'status'])
export class AccountingOutboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @Column({ type: 'varchar', length: 100 })
  event: string

  @Column({ type: 'jsonb' })
  payload: any

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string

  @Column({ type: 'int', default: 0 })
  attempts: number

  @Column({ type: 'text', nullable: true })
  error: string

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamptz', name: 'processed_at', nullable: true })
  processedAt: Date
}
