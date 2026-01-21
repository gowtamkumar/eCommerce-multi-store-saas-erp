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
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { WishlistEntity } from './wishlist.entity';

@Entity('wishlist_items')
export class WishlistItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    wishlistId: string;

    @ManyToOne(() => WishlistEntity, (wishlist) => wishlist.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'wishlistId' })
    wishlist: WishlistEntity;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

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
