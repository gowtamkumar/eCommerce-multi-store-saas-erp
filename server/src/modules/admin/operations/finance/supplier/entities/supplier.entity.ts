import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index, OneToMany } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { SupplierDocumentEntity } from './supplier-document.entity'

@Entity('suppliers')
@Index(['tenantId', 'name'])
export class SupplierEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'varchar', length: 255, name: 'contact_name', nullable: true })
  contactName: string

  @Column({ nullable: true })
  @Index()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity | null

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number

  @Column({ type: 'int', name: 'lead_time_days', default: 0 })
  leadTimeDays: number

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ nullable: true })
  code: string

  @Column({ nullable: true })
  contactPerson: string

  @Column({ nullable: true })
  taxId: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  openingBalance: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  currentBalance: number

  @Column({ default: 'ACTIVE' })
  status: string

  @Column({ type: 'jsonb', nullable: true })
  performance: {
    onTimeDeliveryRate: number
    fulfillmentRate: number
    qualityScore: number
  }

  // Virtual property populated from SupplierAPLedger
  outstandingBalance?: number

  @OneToMany(() => SupplierDocumentEntity, (document) => document.supplier)
  documents: SupplierDocumentEntity[]
}
