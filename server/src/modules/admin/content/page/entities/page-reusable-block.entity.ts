import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/**
 * Saved section trees that staff can re-insert into any page.
 * Think of them as Figma components / Webflow Symbols (snapshot model — no linked instances).
 */
@Entity('page_reusable_blocks')
@Index(['tenantId', 'name'])
export class PageReusableBlockEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null

  @Column({ type: 'varchar', length: 64, default: 'block' })
  category: string

  @Column({ type: 'jsonb' })
  payload: any

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail: string | null

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
