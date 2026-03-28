import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { ProductEntity } from '../../product/entities/product.entity'

@Entity('categories')
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 255 })
  slug: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[]

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
