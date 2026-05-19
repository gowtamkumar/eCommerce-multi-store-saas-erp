import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from './user.entity'
import { RoleEntity } from './role.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * Associates a user with a role, scoped to a specific context (global, branch, or warehouse).
 *
 * A single user can hold MULTIPLE role assignments simultaneously.
 * Assignments can optionally expire (for contractors, temporary promotions).
 *
 * Scope rules:
 * - GLOBAL: applies across the entire tenant
 * - BRANCH: only applies when the user acts on resources within scopeId (branchId)
 * - WAREHOUSE: only applies when the user acts on resources within scopeId (warehouseId)
 *
 * During permission resolution, the guard collects all active (non-expired) role assignments
 * for the user (both global and scoped to the current request context) and unions their permissions.
 */
@Entity('user_role_assignments')
@Index(['userId', 'tenantId'])
@Index(['userId', 'roleId', 'scopeId'], { unique: true })
export class UserRoleAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  /** The boundary within which this role assignment applies */
  @Column({
    type: 'enum',
    enum: RoleScopeType,
    default: RoleScopeType.GLOBAL,
    name: 'scope_type',
  })
  scopeType: RoleScopeType

  /**
   * The specific branch or warehouse UUID this assignment is scoped to.
   * Null when scopeType is GLOBAL.
   */
  @Column({ type: 'uuid', name: 'scope_id', nullable: true })
  scopeId: string | null

  /** Who granted this role assignment (must hold user:manage permission) */
  @Column({ type: 'uuid', name: 'assigned_by', nullable: true })
  assignedBy: string | null

  /**
   * Optional expiry for time-bound access (contractors, temporary promotions).
   * Null = permanent until explicitly revoked.
   */
  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'assigned_at' })
  assignedAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}
