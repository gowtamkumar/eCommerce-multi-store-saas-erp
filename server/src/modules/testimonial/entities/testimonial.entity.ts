import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('testimonials')
export class TestimonialEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    author: string;

    @Column({ type: 'varchar', length: 255 })
    role: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'int', default: 5 })
    rating: number;

    @Column({ type: 'varchar', length: 255, default: 'bg-blue-100 text-blue-600' })
    avatar: string;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
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
