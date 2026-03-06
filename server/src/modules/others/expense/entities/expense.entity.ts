import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { ExpenseCategory } from 'src/common/enums/expense-category.enum';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('expenses')
export class ExpenseEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'date', name: 'expense_date' })
    expenseDate: Date;

    @Column({
        type: 'enum',
        enum: ExpenseCategory,
        default: ExpenseCategory.OTHER,
    })
    category: ExpenseCategory;

    @Column({ type: 'varchar', name: 'reference_number', length: 100, nullable: true })
    referenceNumber: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}
