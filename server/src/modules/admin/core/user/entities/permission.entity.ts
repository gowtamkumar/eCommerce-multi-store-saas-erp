import { RiskLevel } from '@/common/enums/risk-level.enum'
import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'

/**
 * A single atomic capability in the system.
 * Slug format: `feature:action`  (e.g. payroll:approve, pos:refund, inventory:delete)
 *
 * These are platform-owned and seeded on bootstrap. Tenants cannot invent new permissions.
 */
@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Canonical slug: "feature:action" — used everywhere for permission checks */
  @Column()
  @Index({ unique: true })
  code: string

  /** Human-readable label for UI display */
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  /**
   * Logical grouping for the permission tree in the UI.
   * Example: 'POS', 'HRM', 'Finance', 'Inventory'
   */
  @Column()
  module: string

  /**
   * The feature this permission belongs to.
   * Example: 'pos', 'payroll', 'inventory'
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  feature: string

  /**
   * The specific action this permission authorizes.
   * Example: 'view', 'create', 'edit', 'delete', 'approve', 'export'
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  action: string

  /**
   * Sensitivity level used for risk badging in the UI.
   * Critical permissions (delete, export payroll) are highlighted visually.
   */
  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
    name: 'risk_level',
  })
  riskLevel: RiskLevel
}
