import { BaseEntity } from '@/common/base-entity/BaseEntity';
import { PageStatus } from '@/common/enums/page-status.enum';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { UserEntity } from '@/modules/admin/core/user/entities/user.entity';
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity';
import { PageSectionType } from '@/common/enums/page/page-sections-type.enum';
@Entity('pages')
@Index(['slug', 'tenantId'], { unique: true })
export class PageEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  slug: string;

  @Column({ type: 'boolean', name: 'is_home_page', default: false })
  isHomePage: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'jsonb', nullable: true })
  sections: Array<{
    id: string;
    type: PageSectionType;
    settings?: any;
    styles?: any;
    disabled?: boolean;
    children?: any[];
  }>;

  @Column({ type: 'varchar', name: 'meta_title', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', name: 'meta_description', nullable: true })
  metaDescription: string;

  @Column({ type: 'varchar', length: 500, name: 'og_image', nullable: true })
  ogImage: string;

  @Column({ type: 'jsonb', nullable: true })
  typography: {
    fontFamily?: string;
    headingFont?: string;
    baseFontSize?: number;
    headingFontFamily?: string;
    headingFontWeight?: string;
    headingFontSize?: string;
    headingLineHeight?: string;
    paragraphFontFamily?: string;
    paragraphFontWeight?: string;
    paragraphFontSize?: string;
    paragraphLineHeight?: string;
  };

  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.PUBLISHED,
  })
  status: PageStatus;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
