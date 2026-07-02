import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { ProductEntity } from '../../product/entities/product.entity'

@Entity('brands')
export class BrandEntity extends BaseEntity {
  @Column()
  name: string

  @Column()
  @Index()
  slug: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 255, name: 'meta_title', nullable: true })
  metaTitle: string

  @Column({ type: 'varchar', length: 500, name: 'meta_description', nullable: true })
  metaDescription: string

  @Column({ nullable: true })
  image: string

  @Column({ nullable: true })
  website: string

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean

  @OneToMany(() => ProductEntity, (product) => product.brand)
  products: ProductEntity[]

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
