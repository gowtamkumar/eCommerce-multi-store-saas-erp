import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { StoreEntity } from './store.entity'
import { CustomDomainStatus } from '@/common/enums/store/custom-domain-status'

@Entity('store_domains')
export class StoreDomainEntity extends BaseEntity {
  @Column({ name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, (store) => store.domains, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ name: 'hostname', unique: true })
  hostname: string

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean

  @Column({
    type: 'enum',
    enum: CustomDomainStatus,
    default: CustomDomainStatus.PENDING,
  })
  status: CustomDomainStatus

  @Column({ name: 'verification_token', type: 'varchar', length: 64, nullable: true })
  verificationToken: string | null

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null
}
