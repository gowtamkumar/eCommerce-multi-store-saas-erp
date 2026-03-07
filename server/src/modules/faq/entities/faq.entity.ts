import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { FaqStatus } from 'src/common/enums/faq-status.enum';
import { PageEntity } from 'src/modules/page/entities/page.entity';
import { ProductEntity } from 'src/modules/product/entities/product.entity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';

import { UserEntity } from 'src/modules/admin/user/entities/user.entity';import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('faqs')
export class FaqEntity extends BaseEntity {
    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ type: 'varchar', length: 100, default: 'General' })
    category: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({
        type: 'enum',
        enum: FaqStatus,
        default: FaqStatus.ACTIVE,
    })
    status: FaqStatus;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    @Column({ type: 'uuid', nullable: true, name: 'product_id' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @Column({ type: 'uuid', name: 'page_id', nullable: true })
    pageId: string;

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'page_id' })
    page: PageEntity;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
