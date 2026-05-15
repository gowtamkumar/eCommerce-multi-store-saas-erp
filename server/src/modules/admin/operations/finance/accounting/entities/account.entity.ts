import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Index } from 'typeorm'
import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('accounts')
@Index(['tenantId', 'code'], { unique: true })
export class AccountEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type: AccountType

  @Column({
    type: 'enum',
    enum: AccountCategory,
  })
  category: AccountCategory

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'boolean', default: false })
  isSystem: boolean // If true, cannot be deleted (e.g. Inventory, COGS)

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'text', nullable: true })
  description: string
}
