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
 * Associates a user with a role within a tenant.
 *
 * A single user can hold MULTIPLE role assignments simultaneously.
 * The permission engine unions the permissions of all active (non-expired) assignments.
 *
 * Scope columns (scope_type, scope_id) are kept for future use (branch/warehouse filtering).
 * The current resolution engine treats all assignments as tenant-wide (GLOBAL).
 * Assignments can optionally expire — useful for contractors or temporary promotions.
 * Expired assignments are ignored at runtime but NOT automatically deleted.
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

  /**
   * The boundary within which this role assignment applies.
   * Kept for future branch/warehouse scoping. Currently GLOBAL is always used.
   */
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
   * Kept for future use — not currently read by the permission resolver.
   */
  @Column({ type: 'uuid', name: 'scope_id', nullable: true })
  scopeId: string | null

  /** Who granted this role assignment (must hold users:manage permission) */
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
