import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PageEntity } from './page.entity'

/**
 * Immutable snapshot of a page taken every time the page is saved.
 * Used by the editor to view history and revert.
 */
@Entity('page_revisions')
@Index(['pageId', 'createdAt'])
export class PageRevisionEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'page_id' })
  pageId: string

  @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: PageEntity

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'varchar', length: 255, default: '' })
  slug: string

  @Column({ type: 'jsonb', nullable: true })
  sections: any

  @Column({ type: 'jsonb', nullable: true })
  typography: Record<string, unknown> | null

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'meta_title' })
  metaTitle: string | null

  @Column({ type: 'text', nullable: true, name: 'meta_description' })
  metaDescription: string | null

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'og_image' })
  ogImage: string | null

  /** Optional human label, e.g. "Auto save" or a manual note. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdById: string | null
}
