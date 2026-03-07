import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ReviewStatus } from '../../../common/enums/review-status.enum';
import { ProductEntity } from '../../product/entities/product.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

import { UserEntity } from 'src/modules/admin/user/entities/user.entity';
@Entity('reviews')
@Index(['productId', 'status'])
export class ReviewEntity extends BaseEntity {

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @Column({ type: 'varchar', name: 'customer_name', length: 255 })
    customerName: string;

    @Column({ type: 'varchar', name: 'customer_email', length: 255 })
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
