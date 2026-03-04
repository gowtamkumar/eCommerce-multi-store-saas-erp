import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PurchaseOrderStatus } from '../../../../common/enums/purchase-order-status.enum';
import { SupplierEntity } from '../../supplier/entities/supplier.entity';
import { TenantEntity } from '../../../tenant/entities/tenant.entity';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';

@Entity('purchase_orders')
export class PurchaseOrderEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255, name: 'reference_number' })
    referenceNumber: string;

    @Column({ type: 'uuid', name: 'supplier_id' })
    supplierId: string;

    @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'supplier_id' })
    supplier: SupplierEntity;

    @Column({
        type: 'enum',
        enum: PurchaseOrderStatus,
        default: PurchaseOrderStatus.DRAFT,
    })
    status: PurchaseOrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_amount' })
    totalAmount: number;

    @OneToMany(() => PurchaseOrderItemEntity, (item: PurchaseOrderItemEntity) => item.purchaseOrder, { cascade: true })
    items: PurchaseOrderItemEntity[];

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}
