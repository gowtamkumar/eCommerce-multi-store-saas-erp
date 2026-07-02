import { OverrideEffect } from '@/common/enums/override-effect.enum'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from './user.entity'
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

/**
 * A direct per-user permission override that bypasses (or blocks) role-based grants.
 *
 * DENY overrides take absolute precedence over everything — even if the user has a role
 * that grants the permission, a DENY override blocks it.
 *
 * ALLOW overrides grant a permission even if no assigned role grants it.
 *
 * Best practices:
 * - Always require a `reason` and an `expiresAt` — avoid permanent overrides
 * - Use overrides sparingly. If a pattern emerges, fix the role instead.
 * - All overrides are logged in the audit trail
 * - Expired overrides are automatically ignored by the resolution engine (NOT deleted)
 */
@Entity('user_permission_overrides')
@Index(['userId', 'storeId', 'permissionSlug'])
export class UserPermissionOverrideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  /** The permission slug this override applies to. Example: 'payroll:approve' */
  @Column({ type: 'varchar', length: 150, name: 'permission_slug' })
  permissionSlug: string

  /** Whether this override explicitly ALLOWS or DENIES the permission */
  @Column({
    type: 'enum',
    enum: OverrideEffect,
    default: OverrideEffect.ALLOW,
  })
  effect: OverrideEffect

  /** Mandatory: why this override was created (required for audit compliance) */
  @Column({ type: 'text', nullable: true })
  reason: string | null

  /** Who created this override (must hold user:manage permission) */
  @Column({ type: 'uuid', name: 'override_by', nullable: true })
  overrideBy: string | null

  /**
   * When this override expires. After this time, the override is ignored by the resolution engine.
   * Null = never expires (use with extreme caution — always prefer setting an expiry).
   */
  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
