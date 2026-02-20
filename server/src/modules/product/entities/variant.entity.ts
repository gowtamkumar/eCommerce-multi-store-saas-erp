import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_variants')
export class ProductVariantEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number; // Override base price

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'simple-array', nullable: true })
    images: string[];

    @Column({ type: 'jsonb' })
    combination: Record<string, string>; // e.g., { "Color": "Red", "Size": "XL" }

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}
