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

@Entity('product_attributes')
export class ProductAttributeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string; // e.g., "Color", "Size"

    @Column({ type: 'simple-array' })
    values: string[]; // e.g., ["Red", "Blue"] or ["S", "M", "L"]

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => ProductEntity, (product) => product.attributes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column({ type: 'uuid' })
    tenantId: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
