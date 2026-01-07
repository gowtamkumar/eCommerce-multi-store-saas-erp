import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ReviewStatus } from '../../../common/enums/review-status.enum';
import { ProductEntity } from '../../product/entities/product.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('reviews')
@Index(['productId', 'status'])
export class ReviewEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column({ type: 'varchar', length: 255 })
    customerName: string;

    @Column({ type: 'varchar', length: 255 })
    customerEmail: string;

    @Column({ type: 'int', default: 5 })
    rating: number;

    @Column({ type: 'text' })
    comment: string;

    @Column({
        type: 'enum',
        enum: ReviewStatus,
        default: ReviewStatus.PENDING,
    })
    status: ReviewStatus;

    @Column({ type: 'uuid' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenantId' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
