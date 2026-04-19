import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { FaqStatus } from '@/common/enums/faq-status.enum'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { PageEntity } from '@/modules/admin/content/page/entities/page.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('faqs')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'productId'])
@Index(['tenantId', 'pageId'])
export class FaqEntity extends BaseEntity {
  @Column({ type: 'text' })
  question: string

  @Column({ type: 'text' })
  answer: string

  @Column({ type: 'varchar', length: 100, default: 'General' })
  category: string

  @Index()
  @Column({ type: 'int', default: 0 })
  order: number

  @Index()
  @Column({
    type: 'enum',
    enum: FaqStatus,
    default: FaqStatus.ACTIVE,
  })
  status: FaqStatus

  @Index()
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', nullable: true, name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'page_id', nullable: true })
  pageId: string

  @ManyToOne(() => PageEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'page_id' })
  page: PageEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
