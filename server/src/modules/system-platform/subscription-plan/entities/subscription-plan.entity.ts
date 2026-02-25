import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity'
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity('subscription_plans')
export class SubscriptionPlanEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number

    @Column({ type: 'jsonb', default: [] })
    features: string[]

    @Column({ name: 'is_active', default: true })
    isActive: boolean

    @OneToMany(() => TenantEntity, (tenant) => tenant.subscriptionPlan)
    tenants: TenantEntity[]

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date
}
