import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
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
 * Per-tenant on/off switch for each feature.
 * Populated automatically when a tenant is created (based on subscription plan)
 * and synced when the plan changes.
 *
 * Important: rows are NEVER deleted on plan downgrade — only `isEnabled` is set to false.
 * This preserves role-permission configuration so upgrades restore access automatically.
 */
@Entity('tenant_features')
@Index(['tenantId', 'featureSlug'], { unique: true })
@Index(['tenantId'])
export class TenantFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  /** Matches FeatureDefinitionEntity.slug */
  @Column({ type: 'varchar', length: 100, name: 'feature_slug' })
  featureSlug: string

  @Column({ default: true, name: 'is_enabled' })
  isEnabled: boolean

  /** The user (platform admin or tenant owner) who last toggled this feature */
  @Column({ type: 'uuid', nullable: true, name: 'enabled_by' })
  enabledBy: string | null

  @Column({ type: 'timestamptz', nullable: true, name: 'enabled_at' })
  enabledAt: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
