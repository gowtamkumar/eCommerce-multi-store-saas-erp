import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('sessions')
@Index(['userId'])
@Index(['storeId'])
@Index(['expiresAt'])
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid', name: 'store_id', nullable: true })
  storeId: string

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string

  @Column({ name: 'ip_address', type: 'varchar', length: 100, nullable: true })
  ipAddress: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'hashed_refresh_token', type: 'varchar', length: 255, nullable: true })
  hashedRefreshToken: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
