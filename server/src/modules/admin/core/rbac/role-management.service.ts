import { RiskLevel } from '@/common/enums/risk-level.enum'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { DEFAULT_ROLE_DEFINITIONS } from './default-role-definitions'
import { getLegacyRbacRoleName } from './legacy-role-mapping'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { EntityManager, In } from 'typeorm'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'
import { PermissionRepository } from '@/modules/admin/core/user/repositories/permission.repository'
import { UserRoleAssignmentRepository } from '@/modules/admin/core/user/repositories/user-role-assignment.repository'

export interface CreateRoleDto {
  name: string
  description?: string
  permissionCodes?: string[]
}

export interface UpdateRoleDto {
  name?: string
  description?: string
  permissionCodes?: string[]
}

/**
 * Manages the lifecycle of roles within a store.
 * Enforces the rule that system roles (isSystemRole=true) cannot be modified or deleted.
 */
@Injectable()
export class RoleManagementService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleManagementService.name)

  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly permissionRepo: PermissionRepository,
    private readonly assignmentRepo: UserRoleAssignmentRepository,
    private readonly auditLogService: AuditLogService,
    private readonly permissionResolutionService: PermissionResolutionService,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    const systemInserted = await this.syncSystemRolePermissions()
    const defaultInserted = await this.syncDefaultRolePermissions()
    if (systemInserted + defaultInserted > 0) {
      await this.invalidateAllPermissionCaches()
    }
  }

  /**
   * Store "Super Admin" system roles are provisioned at signup with a snapshot of
   * permissions. Keep them in sync when new platform permissions are introduced.
   */
  async syncSystemRolePermissions(): Promise<number> {
    const inserted = await this.roleRepo.syncSystemRolePermissions()
    if (inserted > 0) {
      this.logger.log(`Synced ${inserted} permission link(s) onto system roles`)
    }
    return inserted
  }

  /**
   * Ensure seeded default roles retain their expected permission sets.
   */
  async syncDefaultRolePermissions(): Promise<number> {
    const inserted = await this.roleRepo.syncDefaultRolePermissions(DEFAULT_ROLE_DEFINITIONS)
    if (inserted > 0) {
      this.logger.log(`Synced ${inserted} permission link(s) onto default roles`)
    }
    return inserted
  }

  private async invalidateAllPermissionCaches(): Promise<void> {
    await this.permissionResolutionService.invalidateStorePermissionCaches()
  }

  // ─────────────────────────────────────────────────────────────────
  // Role CRUD
  // ─────────────────────────────────────────────────────────────────

  async getAllRoles(storeId: string): Promise<RoleEntity[]> {
    return this.roleRepo.find({
      where: [{ storeId }, { isSystemDefault: true }],
      relations: {
        permissions: true,
      },
      order: { isSystemRole: 'DESC', name: 'ASC' },
    })
  }

  async getRoleById(roleId: string, storeId: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId, storeId },
      relations: {
        permissions: true,
      },
    })
    if (!role) throw new NotFoundException(`Role ${roleId} not found`)
    return role
  }

  async createRole(
    storeId: string,
    actorId: string,
    actorName: string,
    dto: CreateRoleDto,
  ): Promise<RoleEntity> {
    this.logger.log(`Creating role "${dto.name}" for store ${storeId}`)

    const permissions = dto.permissionCodes?.length
      ? await this.permissionRepo.find({ where: { code: In(dto.permissionCodes) } })
      : []

    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description,
      storeId,
      permissions,
      isSystemRole: false,
      isSystemDefault: false,
    })

    const saved = await this.roleRepo.save(role)

    await this.auditLogService.logRoleCreated(
      storeId,
      actorId,
      actorName,
      saved.id,
      saved.name,
      permissions.map((p) => p.code),
    )

    return saved
  }

  async updateRole(
    roleId: string,
    storeId: string,
    actorId: string,
    actorName: string,
    dto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    const role = await this.getRoleById(roleId, storeId)

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be modified.')
    }

    const before = {
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map((p) => p.code) ?? [],
    }

    if (dto.name !== undefined) role.name = dto.name
    if (dto.description !== undefined) role.description = dto.description

    if (dto.permissionCodes !== undefined) {
      role.permissions = dto.permissionCodes.length
        ? await this.permissionRepo.find({ where: { code: In(dto.permissionCodes) } })
        : []
    }

    const saved = await this.roleRepo.save(role)

    const after = {
      name: saved.name,
      description: saved.description,
      permissions: saved.permissions?.map((p) => p.code) ?? [],
    }

    await this.auditLogService.logRoleModified(storeId, actorId, actorName, roleId, before, after)

    // Invalidate permission cache for all users assigned to this role
    await this.invalidateCacheForRoleUsers(roleId, storeId)

    return saved
  }

  async deleteRole(
    roleId: string,
    storeId: string,
    actorId: string,
    actorName: string,
  ): Promise<void> {
    const role = await this.getRoleById(roleId, storeId)

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be deleted.')
    }

    await this.auditLogService.logRoleDeleted(storeId, actorId, actorName, roleId, role.name)
    await this.invalidateCacheForRoleUsers(roleId, storeId)
    await this.roleRepo.remove(role)
  }

  async cloneRole(
    sourceRoleId: string,
    storeId: string,
    actorId: string,
    actorName: string,
    newName: string,
  ): Promise<RoleEntity> {
    const source = await this.getRoleById(sourceRoleId, storeId)
    return this.createRole(storeId, actorId, actorName, {
      name: newName,
      description: `Cloned from: ${source.name}`,
      permissionCodes: source.permissions?.map((p) => p.code) ?? [],
    })
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Assignment
  // ─────────────────────────────────────────────────────────────────

  async assignPermissionsToRole(
    roleId: string,
    storeId: string,
    actorId: string,
    actorName: string,
    permissionCodes: string[],
  ): Promise<RoleEntity> {
    return this.updateRole(roleId, storeId, actorId, actorName, { permissionCodes })
  }

  // ─────────────────────────────────────────────────────────────────
  // Legacy role → RBAC bridge
  // ─────────────────────────────────────────────────────────────────

  /**
   * When a staff user has a legacy `users.role` but no RBAC assignment
   * (common for invites that omitted roleId), auto-assign the matching default role.
   */
  async ensureLegacyRoleAssignment(
    userId: string,
    storeId: string,
    legacyRole: string,
    scope?: { branchId?: string | null; warehouseId?: string | null },
  ): Promise<boolean> {
    const normalizedRole = (legacyRole || '').toLowerCase()
    if (!normalizedRole || normalizedRole === UserRole.SUPER_ADMIN || normalizedRole === UserRole.USER) {
      return false
    }

    const existingCount = await this.assignmentRepo.count({ where: { userId, storeId } })
    if (existingCount > 0) return false

    const roleName = getLegacyRbacRoleName(normalizedRole)
    if (!roleName) return false

    const role = await this.roleRepo.findOne({ where: { name: roleName, storeId } })
    if (!role) {
      this.logger.warn(
        `Legacy RBAC bridge: role "${roleName}" not found for store ${storeId} (user ${userId})`,
      )
      return false
    }

    const scopeType = scope?.branchId
      ? RoleScopeType.BRANCH
      : scope?.warehouseId
        ? RoleScopeType.WAREHOUSE
        : RoleScopeType.GLOBAL

    await this.assignmentRepo.save(
      this.assignmentRepo.create({
        userId,
        roleId: role.id,
        storeId,
        scopeType,
        scopeId: scope?.branchId || scope?.warehouseId || null,
        assignedBy: null,
      }),
    )

    await this.permissionResolutionService.invalidateUserPermissionCache(userId, storeId)
    this.logger.log(
      `Assigned legacy RBAC role "${roleName}" to user ${userId} in store ${storeId}`,
    )
    return true
  }

  // ─────────────────────────────────────────────────────────────────
  // Store Bootstrap
  // ─────────────────────────────────────────────────────────────────

  /**
   * Seed the Super Admin system role for a new store.
   * Called during store creation. Gets ALL available permissions.
   * isSystemRole = true — immutable and non-deletable.
   */
  async seedSuperAdminRole(storeId: string, manager?: EntityManager): Promise<RoleEntity> {
    const repo = this.roleRepo.txRepo(manager)
    const permRepo = this.permissionRepo.txRepo(manager)

    const allPermissions = await permRepo.find()

    const superAdminRole = repo.create({
      name: 'Super Admin',
      description: 'Full access to all features and settings. Cannot be modified or deleted.',
      storeId,
      isSystemRole: true,
      isSystemDefault: true,
      permissions: allPermissions,
    })

    return repo.save(superAdminRole)
  }

  /**
   * Seed the 7 default roles for a new store.
   * These are deletable/modifiable by the store admin (isSystemRole = false).
   */
  async seedDefaultRoles(storeId: string, manager?: EntityManager): Promise<RoleEntity[]> {
    const repo = this.roleRepo.txRepo(manager)
    const permRepo = this.permissionRepo.txRepo(manager)

    const defaultRoleDefs = DEFAULT_ROLE_DEFINITIONS

    const savedRoles: RoleEntity[] = []

    for (const def of defaultRoleDefs) {
      const existingRole = await repo.findOne({ where: { name: def.name, storeId } })
      if (existingRole) {
        savedRoles.push(existingRole)
        continue
      }

      const permissions = def.permCodes.length
        ? await permRepo.find({ where: { code: In(def.permCodes) } })
        : []

      const role = repo.create({
        name: def.name,
        description: def.description,
        storeId,
        isSystemRole: false,
        isSystemDefault: false,
        permissions,
      })

      savedRoles.push(await repo.save(role))
    }

    return savedRoles
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────

  /**
   * When a role is modified or deleted, invalidate the cached manifests
   * of all users currently assigned to that role.
   */
  private async invalidateCacheForRoleUsers(roleId: string, storeId: string): Promise<void> {
    const assignments = await this.assignmentRepo.find({
      where: { roleId, storeId },
      select: {
        userId: true,
      },
    })

    await Promise.all(
      assignments.map((a) =>
        this.permissionResolutionService.invalidateUserPermissionCache(a.userId, storeId),
      ),
    )
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Catalog Query
  // ─────────────────────────────────────────────────────────────────

  async getAllPermissions(): Promise<PermissionEntity[]> {
    this.logger.log('Fetching all permissions...')
    const permissions = await this.permissionRepo.find({
      order: { module: 'ASC', feature: 'ASC', action: 'ASC' },
    })
    this.logger.log(`Found ${permissions.length} permissions`)
    return permissions
  }

  async getPermissionsByFeature(): Promise<Record<string, PermissionEntity[]>> {
    this.logger.log('Fetching permissions by feature...')
    const permissions = await this.getAllPermissions()
    const result = permissions.reduce(
      (acc, p) => {
        const key = p.feature || p.module
        if (!acc[key]) acc[key] = []
        acc[key].push(p)
        return acc
      },
      {} as Record<string, PermissionEntity[]>,
    )
    this.logger.log(`Grouped ${permissions.length} permissions by feature`)
    return result
  }

  /**
   * Get permissions grouped by risk level — useful for UI to show risk badges.
   */
  getPermissionsByRiskLevel(permissions: PermissionEntity[]): Record<RiskLevel, string[]> {
    const result: Record<RiskLevel, string[]> = {
      [RiskLevel.LOW]: [],
      [RiskLevel.MEDIUM]: [],
      [RiskLevel.HIGH]: [],
      [RiskLevel.CRITICAL]: [],
    }
    for (const p of permissions) {
      result[p.riskLevel]?.push(p.code)
    }
    return result
  }
}
