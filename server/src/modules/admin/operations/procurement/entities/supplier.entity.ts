import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('suppliers')
export class SupplierEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  category: string

  @Column({ nullable: true })
  contactPerson: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ nullable: true })
  taxId: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingBalance: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentBalance: number

  @Column({ default: 'ACTIVE' })
  status: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'jsonb', nullable: true })
  performance: {
    onTimeDeliveryRate: number
    fulfillmentRate: number
    qualityScore: number
  }
}
