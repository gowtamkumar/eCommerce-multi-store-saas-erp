import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

@Entity('loyalty_configs')
export class LoyaltyConfigEntity extends BaseEntity {
  @Column({ type: 'boolean', name: 'is_enabled', default: true })
  isEnabled: boolean

  // Earning rules: spent unit to point. E.g. $1 spent = 1 point
  @Column({ type: 'decimal', name: 'points_per_currency_spent', precision: 10, scale: 2, default: 1.0 })
  pointsPerCurrencySpent: number

  // Redemption rules: e.g. 100 points = $1 discount
  @Column({ type: 'integer', name: 'points_required_per_currency_discount', default: 100 })
  pointsRequiredPerCurrencyDiscount: number

  // Tier Thresholds (Accumulated spending in 12 months)
  @Column({ type: 'decimal', name: 'silver_tier_threshold', precision: 10, scale: 2, default: 500.0 })
  silverTierThreshold: number

  @Column({ type: 'decimal', name: 'gold_tier_threshold', precision: 10, scale: 2, default: 1500.0 })
  goldTierThreshold: number

  @Column({ type: 'decimal', name: 'platinum_tier_threshold', precision: 10, scale: 2, default: 5000.0 })
  platinumTierThreshold: number

  // Tier Point Multipliers
  @Column({ type: 'decimal', name: 'silver_multiplier', precision: 5, scale: 2, default: 1.10 })
  silverMultiplier: number

  @Column({ type: 'decimal', name: 'gold_multiplier', precision: 5, scale: 2, default: 1.25 })
  goldMultiplier: number

  @Column({ type: 'decimal', name: 'platinum_multiplier', precision: 5, scale: 2, default: 1.50 })
  platinumMultiplier: number

  // Referral Rewards
  @Column({ type: 'varchar', name: 'referral_reward_type', default: 'WALLET' }) // 'WALLET' or 'POINTS'
  referralRewardType: 'WALLET' | 'POINTS'

  @Column({ type: 'decimal', name: 'referral_reward_amount', precision: 10, scale: 2, default: 10.0 })
  referralRewardAmount: number // $10 wallet credit or 1000 points

  @Column({ type: 'decimal', name: 'referee_min_purchase', precision: 10, scale: 2, default: 20.0 })
  refereeMinPurchase: number // Minimum spent on referee's first purchase to qualify referrer's reward

  /**
   * Points expire this many days after they're earned (NULL = never).
   * Drives both `creditPoints({expiresAt})` and the daily expiry sweep.
   */
  @Column({ type: 'integer', name: 'points_expire_after_days', nullable: true })
  pointsExpireAfterDays: number | null

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @OneToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
