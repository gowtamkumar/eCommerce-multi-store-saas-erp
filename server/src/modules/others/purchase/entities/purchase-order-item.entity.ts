import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from '../../../product/entities/product.entity';
import { ProductVariantEntity } from '../../../product/entities/variant.entity';
import { PurchaseOrderEntity } from './purchase-order.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItemEntity extends BaseEntity {
    @Column({ type: 'uuid', name: 'purchase_order_id' })
    purchaseOrderId: string;

    @ManyToOne(() => PurchaseOrderEntity, (po: PurchaseOrderEntity) => po.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder: PurchaseOrderEntity;

    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @Column({ type: 'uuid', name: 'variant_id', nullable: true })
    variantId: string;

    @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariantEntity;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
    unitPrice: number;
}
