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

    @Column({ type: 'uuid' })
    orderId: string;

    @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column({ type: 'uuid', nullable: true })
    variantId: string;

    @ManyToOne(() => ProductVariantEntity)
    @JoinColumn({ name: 'variantId' })
    variant: ProductVariantEntity;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'uuid' })
    tenantId: string;

    @ManyToOne(() => TenantEntity)
    @JoinColumn({ name: 'tenantId' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
