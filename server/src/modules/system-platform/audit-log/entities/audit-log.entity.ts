import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'entity', 'entityId'])
@Index(['tenantId', 'userId'])
export class AuditLogEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    @Column({ type: 'uuid', name: 'user_id', nullable: true })
    userId: string;

    /** e.g. CREATE, UPDATE, DELETE, LOGIN, LOGOUT */
    @Column({ type: 'varchar', length: 100 })
    action: string;

    /** e.g. Product, Order, Category */
    @Column({ type: 'varchar', length: 100 })
    entity: string;

    @Column({ type: 'varchar', length: 255, name: 'entity_id', nullable: true })
    entityId: string;

    @Column({ type: 'jsonb', name: 'old_value', nullable: true })
    oldValue: Record<string, any>;

    @Column({ type: 'jsonb', name: 'new_value', nullable: true })
    newValue: Record<string, any>;

    @Column({ type: 'varchar', length: 45, name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ type: 'text', name: 'user_agent', nullable: true })
    userAgent: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;
}
