import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { FaqStatus } from '../../../common/enums/faq-status.enum';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('faqs')
export class FaqEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ type: 'varchar', length: 100, default: 'General' })
    category: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({
        type: 'enum',
        enum: FaqStatus,
        default: FaqStatus.ACTIVE,
    })
    status: FaqStatus;

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
