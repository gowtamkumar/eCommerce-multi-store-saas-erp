import { FeatureTier } from '@/common/enums/feature-tier.enum'
import { Column, Entity, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * Platform-owned catalog of all available features.
 * Seeded by the platform on application bootstrap.
 * Tenants cannot create or modify these — only the platform can.
 */
@Entity('feature_definitions')
export class FeatureDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /**
   * Canonical slug used throughout the system.
   * Must match strings stored in SubscriptionPlanEntity.features[].
   * Example: 'payroll', 'pos', 'inventory', 'hrm'
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index({ unique: true })
  slug: string

  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  displayName: string

  @Column({ type: 'text', nullable: true })
  description: string

  /**
   * Which subscription tier unlocks this feature.
   * 'core' features are always enabled for all tenants.
   */
  @Column({
    type: 'enum',
    enum: FeatureTier,
    default: FeatureTier.STARTER,
    name: 'plan_tier',
  })
  planTier: FeatureTier

  /**
   * Core features (user management, audit logs, settings) are always enabled.
   * They cannot be disabled by the tenant admin.
   */
  @Column({ default: false, name: 'is_core' })
  isCore: boolean

  @Column({ default: true, name: 'is_active' })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
