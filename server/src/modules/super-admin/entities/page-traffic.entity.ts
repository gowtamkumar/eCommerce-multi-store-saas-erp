import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('page_traffic')
@Unique(['tenantId', 'path', 'date'])
export class PageTrafficEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenantId: string;

    @Column()
    path: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', default: 0 })
    requestCount: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;
}
