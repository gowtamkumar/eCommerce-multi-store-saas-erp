import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { PermissionEntity } from './permission.entity'
import { RoleScopeType } from '@/common/enums/role-scope-type.enum'

/**
 * A named collection of permissions assigned to users within a tenant.
 *
 * System roles (isSystemRole = true) are auto-provisioned on tenant creation.
 * They cannot be modified or deleted — attempting to do so throws a ForbiddenException.
 *
 * Role inheritance: if parentRoleId is set, the effective permissions of this role
 * are the union of its own permissions + all inherited parent permissions (walked up the chain).
 */
@Entity('roles')
@Index(['name', 'tenantId'], { unique: true })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  /**
   * System roles are auto-created on tenant bootstrap (e.g. "Super Admin").
   * They cannot be modified or deleted by the tenant admin.
   * @deprecated use isSystemRole instead — kept for backward compat
   */
  @Column({ default: false, name: 'is_system_default' })
  isSystemDefault: boolean

  /**
   * Canonical guard flag. True = this role is immutable and non-deletable.
   * Set to true for "Super Admin" and any other platform-provisioned roles.
   */
  @Column({ default: false, name: 'is_system_role' })
  isSystemRole: boolean

  /**
   * Optional parent role for inheritance.
   * The effective permission set = union(own permissions + parent permissions, recursively).
   */
  @Column({ type: 'uuid', name: 'parent_role_id', nullable: true })
  parentRoleId: string | null

  @ManyToOne(() => RoleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: RoleEntity | null

  /**
   * Default scope context for this role.
   * When assigning this role to a user, the UI suggests this scope type.
   * Example: Branch Manager defaults to BRANCH scope.
   */
  @Column({
    type: 'enum',
    enum: RoleScopeType,
    default: RoleScopeType.GLOBAL,
    name: 'scope_type',
  })
  scopeType: RoleScopeType

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  /** Direct permissions assigned to this role (not inherited) */
  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[]
}
