import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { ProductEntity } from '../../product/entities/product.entity'

@Entity('categories')
@Index(['tenantId', 'slug'])
@Index(['tenantId', 'parentId'])
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 255 })
  slug: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 255, name: 'meta_title', nullable: true })
  metaTitle: string

  @Column({ type: 'varchar', length: 500, name: 'meta_description', nullable: true })
  metaDescription: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string

  @ManyToOne(() => CategoryEntity, (cat) => cat.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: CategoryEntity

  @OneToMany(() => CategoryEntity, (cat) => cat.parent)
  children: CategoryEntity[]

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[]

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
