import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Index } from 'typeorm'
import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

@Entity('accounts')
@Index(['storeId', 'code'], { unique: true })
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

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'text', nullable: true })
  description: string
}
