import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'

export enum SubscriberStatus {
  /** Just signed up; awaiting double opt-in confirmation. */
  PENDING = 'pending',
  /** Confirmed via verify link; eligible for campaigns. */
  CONFIRMED = 'confirmed',
  /** User clicked unsubscribe; campaigns must skip. */
  UNSUBSCRIBED = 'unsubscribed',
  /** ESP-level hard bounce / spam complaint. Permanent suppression. */
  SUPPRESSED = 'suppressed',
}

/**
 * Database Index: Optimizes chronological and store-based lookups
 * Unique Constraint: Ensures an email is only subscribed once per store
 *
 * Email is stored lowercase, see normalization in service layer + migration.
 */
@Index(['createdAt'])
@Index(['storeId'])
@Index(['storeId', 'status'])
@Unique('UQ_subscribers_store_email', ['storeId', 'email'])
@Entity('subscribers')
export class SubscriberEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  email: string

  /** Convenience flag mirrored from `status === CONFIRMED` for legacy queries. */
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({
    type: 'enum',
    enum: SubscriberStatus,
    default: SubscriberStatus.PENDING,
  })
  status: SubscriberStatus

  /**
   * Single-use token sent in the double-opt-in confirmation email.
   * Cleared once the recipient confirms.
   */
  @Column({ type: 'varchar', length: 64, name: 'confirmation_token', nullable: true })
  @Index()
  confirmationToken: string | null

  /** Long-lived signed token included in every campaign unsubscribe link. */
  @Column({ type: 'varchar', length: 64, name: 'unsubscribe_token', nullable: true })
  @Index()
  unsubscribeToken: string | null

  @Column({ type: 'timestamp', name: 'confirmed_at', nullable: true })
  confirmedAt: Date | null

  @Column({ type: 'timestamp', name: 'unsubscribed_at', nullable: true })
  unsubscribedAt: Date | null

  /**
   * GDPR + audit: where the signup happened (form-id, page slug, etc.) and the
   * IP/UA collected at the moment of consent.
   */
  @Column({ type: 'varchar', length: 120, nullable: true })
  source: string | null

  @Column({ type: 'varchar', length: 45, name: 'consent_ip', nullable: true })
  consentIp: string | null

  @Column({ type: 'varchar', length: 255, name: 'consent_user_agent', nullable: true })
  consentUserAgent: string | null

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
