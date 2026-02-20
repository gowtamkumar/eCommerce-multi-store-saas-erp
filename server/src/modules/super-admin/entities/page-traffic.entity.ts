import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('page_traffic')
@Unique(['tenantId', 'path', 'date'])
export class PageTrafficEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @Column()
    path: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', name: "request_count", default: 0 })
    requestCount: number;

    @Column({ type: 'timestamptz', name: 'last_updated', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;
}
