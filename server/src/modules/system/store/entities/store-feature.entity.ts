import { StoreEntity } from '@/modules/system/store/entities/store.entity'
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
 * Per-store on/off switch for each feature.
 * Populated automatically when a store is created (based on subscription plan)
 * and synced when the plan changes.
 *
 * Important: rows are NEVER deleted on plan downgrade — only `isEnabled` is set to false.
 * This preserves role-permission configuration so upgrades restore access automatically.
 */
@Entity('store_features')
@Index(['storeId', 'featureSlug'], { unique: true })
@Index(['storeId'])
export class StoreFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'varchar', length: 100, name: 'feature_slug' })
  featureSlug: string

  @Column({ default: true, name: 'is_enabled' })
  isEnabled: boolean

  /** The user (platform admin or store owner) who last toggled this feature */
  @Column({ type: 'uuid', nullable: true, name: 'enabled_by' })
  enabledBy: string | null

  @Column({ type: 'timestamptz', nullable: true, name: 'enabled_at' })
  enabledAt: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
