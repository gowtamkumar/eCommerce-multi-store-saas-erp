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
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    cartId: string;

    @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cartId' })
    cart: CartEntity;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column({ type: 'uuid', nullable: true })
    variantId: string;

    @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'variantId' })
    variant: ProductVariantEntity;

    @Column({ type: 'int', default: 1 })
    quantity: number;

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
