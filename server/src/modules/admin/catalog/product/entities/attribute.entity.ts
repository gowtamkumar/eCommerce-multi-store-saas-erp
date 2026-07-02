import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ProductEntity } from './product.entity'

@Entity('product_attributes')
export class ProductAttributeEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string // e.g., "Color", "Size"

  @Column({ type: 'simple-array' })
  values: string[] // e.g., ["Red", "Blue"] or ["S", "M", "L"]

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
