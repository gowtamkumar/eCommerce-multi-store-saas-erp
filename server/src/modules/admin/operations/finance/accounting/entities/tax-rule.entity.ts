import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'

export enum TaxCategory {
  STANDARD = 'STANDARD',
  REDUCED = 'REDUCED',
  ZERO_RATED = 'ZERO_RATED',
  EXEMPT = 'EXEMPT',
}

@Entity('tax_rules')
@Index(['tenantId', 'country', 'state'])
export class TaxRuleEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'varchar', length: 100 })
  name: string // e.g. "VAT standard BD", "Sales Tax CA"

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number // e.g. 15.00 for 15%

  @Column({ type: 'varchar', length: 2 })
  country: string // e.g. "BD", "US", "GB"

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string // e.g. "Dhaka", "NY", "CA"

  @Column({
    type: 'enum',
    enum: TaxCategory,
    default: TaxCategory.STANDARD,
  })
  category: TaxCategory

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem: boolean
}
