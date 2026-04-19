import { ReviewStatus } from '@/common/enums/review-status.enum'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BaseEntity } from 'src/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('reviews')
@Index(['productId', 'status'])
@Index(['tenantId', 'status'])
export class ReviewEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'int', default: 5 })
  rating: number

  @Column({ type: 'text' })
  comment: string

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
