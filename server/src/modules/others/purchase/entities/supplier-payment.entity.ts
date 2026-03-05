import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { SupplierEntity } from '../../supplier/entities/supplier.entity';
import { TenantEntity } from '../../../tenant/entities/tenant.entity';

@Entity('supplier_payments')
export class SupplierPaymentEntity extends BaseEntity {
    @Column({ type: 'uuid', name: 'purchase_order_id' })
    purchaseOrderId: string;

    @ManyToOne(() => PurchaseOrderEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder: PurchaseOrderEntity;

    @Column({ type: 'uuid', name: 'supplier_id' })
    supplierId: string;

    @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'supplier_id' })
    supplier: SupplierEntity;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp', name: 'payment_date', default: () => 'CURRENT_TIMESTAMP' })
    paymentDate: Date;

    @Column({ type: 'varchar', name: 'payment_method', length: 50 })
    paymentMethod: string;

    @Column({ type: 'varchar', name: 'transaction_id', length: 255, nullable: true })
    transactionId: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}
