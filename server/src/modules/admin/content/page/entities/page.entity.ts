import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { PageStatus } from '@/common/enums/page-status.enum'
import { PageSectionType } from '@/common/enums/page/page-sections-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('pages')
@Index(['slug', 'storeId'], { unique: true })
@Index(['storeId', 'isHomePage']) // Hot path: storefront home page lookup
export class PageEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'varchar', length: 255, default: '' })
  slug: string

  @Column({ type: 'boolean', name: 'is_home_page', default: false })
  isHomePage: boolean

  @Column({ type: 'int', default: 0 })
  order: number

  @Column({ type: 'jsonb', nullable: true })
  sections: Array<{
    id: string
    type: PageSectionType
    settings?: any
    styles?: any
    /** Universal soft-hide flag; storefront skips these. */
    hidden?: boolean
    /** Per-breakpoint visibility. Missing keys default to true. */
    visibility?: { desktop?: boolean; tablet?: boolean; mobile?: boolean }
    locked?: boolean
    children?: any[]
  }>

  @Column({ type: 'varchar', name: 'meta_title', length: 255, nullable: true })
  metaTitle: string

  @Column({ type: 'text', name: 'meta_description', nullable: true })
  metaDescription: string

  @Column({ type: 'varchar', length: 500, name: 'og_image', nullable: true })
  ogImage: string

  @Column({ type: 'jsonb', nullable: true })
  typography: {
    fontFamily?: string
    headingFont?: string
    baseFontSize?: number
    headingFontFamily?: string
    headingFontWeight?: string
    headingFontSize?: string
    headingLineHeight?: string
    paragraphFontFamily?: string
    paragraphFontWeight?: string
    paragraphFontSize?: string
    paragraphLineHeight?: string
  }

  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.PUBLISHED,
  })
  status: PageStatus

  /** When set, page becomes published automatically at this timestamp via the scheduler. */
  @Column({ type: 'timestamptz', name: 'publish_at', nullable: true })
  @Index()
  publishAt: Date | null

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
