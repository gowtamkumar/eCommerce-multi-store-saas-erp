import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export type StorefrontSearchMode = 'keyword' | 'hybrid'

@Entity('storefront_search_events')
@Index(['storeId', 'createdAt'])
export class StorefrontSearchEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string

  @Column({ type: 'varchar', length: 16 })
  mode: StorefrontSearchMode

  @Column({ name: 'result_count', type: 'int', default: 0 })
  resultCount: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date
}
