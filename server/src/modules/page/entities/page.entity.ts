import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('pages')
@Index(['slug', 'tenantId'], { unique: true })
export class PageEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    slug: string;

    @Column({ type: 'boolean', default: false })
    isHomePage: boolean;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'jsonb', nullable: true })
    sections: Array<{
        id: string;
        type: 'hero' | 'features' | 'product-grid' | 'rich-text' | 'collection';
        content: any;
        settings?: any;
    }>;

    @Column({ type: 'varchar', length: 255, nullable: true })
    metaTitle: string;

    @Column({ type: 'text', nullable: true })
    metaDescription: string;

    @Column({
        type: 'enum',
        enum: ['draft', 'published'],
        default: 'published',
    })
    status: string;

    @Column({ type: 'uuid' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenantId' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
