import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from '../../product/entities/product.entity';
import { ProductVariantEntity } from '../../product/entities/variant.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'order_id' })
    orderId: string;

    @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @Column({ type: 'uuid', nullable: true, name: 'variant_id' })
    variantId: string;

    @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariantEntity;

    @Column({ type: 'jsonb', nullable: true })
    snapshot: any;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', name: 'unit_price', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', name: 'discount_amount', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'decimal', name: 'total_amount', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}
