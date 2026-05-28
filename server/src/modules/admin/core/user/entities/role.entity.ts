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

/**
 * A named collection of permissions assigned to users within a tenant.
 *
 * System roles (isSystemRole = true) are auto-provisioned on tenant creation.
 * They cannot be modified or deleted — attempting to do so throws a ForbiddenException.
 *
 * Roles are flat — there is no inheritance chain. Assign multiple roles to a user
 * to combine their permissions (the resolution engine unions all active assignments).
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
   * Canonical guard flag. True = this role is immutable and non-deletable.
   * Set to true for "Super Admin" and any other platform-provisioned roles.
   */
  @Column({ default: false, name: 'is_system_role' })
  isSystemRole: boolean

  /** @deprecated use isSystemRole instead — kept for backward compatibility */
  @Column({ default: false, name: 'is_system_default' })
  isSystemDefault: boolean

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  /** Direct permissions assigned to this role */
  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[]
}
