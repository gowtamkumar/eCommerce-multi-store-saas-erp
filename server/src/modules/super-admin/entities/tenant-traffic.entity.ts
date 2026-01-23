import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('tenant_traffic')
@Unique(['tenantId', 'date'])
export class TenantTrafficEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenantId: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', default: 0 })
    requestCount: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;
}
