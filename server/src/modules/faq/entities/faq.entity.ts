import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FaqStatus } from '../../../common/enums/faq-status.enum';
import { PageEntity } from '../../page/entities/page.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

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
}
