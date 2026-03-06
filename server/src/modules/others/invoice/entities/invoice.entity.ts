import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { InvoiceStatus } from 'src/common/enums/invoice-status.enum';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('invoices')
export class InvoiceEntity extends BaseEntity {
    @Column({ type: 'varchar', name: 'invoice_number', unique: true, length: 100 })
    invoiceNumber: string;

    @Column({ type: 'uuid', name: 'order_id' })
    orderId: string;

    @ManyToOne(() => OrderEntity)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column({ type: 'date', name: 'issue_date' })
    issueDate: Date;

    @Column({ type: 'date', name: 'due_date', nullable: true })
    dueDate: Date;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.PENDING,
    })
    status: InvoiceStatus;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}
