import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

@Entity('tenants')
export class TenantEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    storeName: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    subdomain: string;

    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    customDomain: string;

    @Column({
        type: 'enum',
        enum: ['basic', 'pro', 'enterprise'],
        default: 'basic',
    })
    planTier: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
