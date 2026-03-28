import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('brands')
export class BrandEntity extends BaseEntity {
  @Column()
  name: string

  @Column()
  slug: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ nullable: true })
  image: string

  @Column({ nullable: true })
  website: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
