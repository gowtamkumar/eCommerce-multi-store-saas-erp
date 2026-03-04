import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from '../../../tenant/entities/tenant.entity';

@Entity('suppliers')
export class SupplierEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, name: 'contact_name', nullable: true })
    contactName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}
