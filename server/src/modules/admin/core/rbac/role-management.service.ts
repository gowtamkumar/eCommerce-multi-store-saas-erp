import { getTransactionalRepo } from '@/common/utils/repository.util'
import { RiskLevel } from '@/common/enums/risk-level.enum'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { DEFAULT_ROLE_DEFINITIONS } from './default-role-definitions'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'

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
 * Manages the lifecycle of roles within a tenant.
 * Enforces the rule that system roles (isSystemRole=true) cannot be modified or deleted.
 */
@Injectable()
export class RoleManagementService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleManagementService.name)

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,

    @InjectRepository(UserRoleAssignmentEntity)
    private readonly assignmentRepo: Repository<UserRoleAssignmentEntity>,

    private readonly auditLogService: AuditLogService,
    private readonly permissionResolutionService: PermissionResolutionService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const systemInserted = await this.syncSystemRolePermissions()
    const defaultInserted = await this.syncDefaultRolePermissions()
    if (systemInserted + defaultInserted > 0) {
      await this.invalidateAllPermissionCaches()
    }
  }

  /**
   * Tenant "Super Admin" system roles are provisioned at signup with a snapshot of
   * permissions. Keep them in sync when new platform permissions are introduced.
   */
  async syncSystemRolePermissions(): Promise<number> {
    const result = await this.roleRepo.manager.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r."is_system_role" = true
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp
          WHERE rp."role_id" = r.id AND rp."permission_id" = p.id
        )
    `)

    const inserted = typeof result?.[1] === 'number' ? result[1] : 0
    if (inserted > 0) {
      this.logger.log(`Synced ${inserted} permission link(s) onto system roles`)
    }
    return inserted
  }

  /**
   * Ensure seeded default roles retain their expected permission sets.
   */
  async syncDefaultRolePermissions(): Promise<number> {
    let inserted = 0

    for (const def of DEFAULT_ROLE_DEFINITIONS) {
      const result = await this.roleRepo.manager.query(
        `
        INSERT INTO "role_permissions" ("role_id", "permission_id")
        SELECT r.id, p.id
        FROM "roles" r
        INNER JOIN "permissions" p ON p.code = ANY($1::text[])
        WHERE r.name = $2
          AND r."is_system_role" = false
          AND NOT EXISTS (
            SELECT 1 FROM "role_permissions" rp
            WHERE rp."role_id" = r.id AND rp."permission_id" = p.id
          )
      `,
        [def.permCodes, def.name],
      )

      if (typeof result?.[1] === 'number') {
        inserted += result[1]
      }
    }

    if (inserted > 0) {
      this.logger.log(`Synced ${inserted} permission link(s) onto default roles`)
    }
    return inserted
  }

  private async invalidateAllPermissionCaches(): Promise<void> {
    await this.permissionResolutionService.invalidateTenantPermissionCaches()
  }

  // ─────────────────────────────────────────────────────────────────
  // Role CRUD
  // ─────────────────────────────────────────────────────────────────

  async getAllRoles(tenantId: string): Promise<RoleEntity[]> {
    return this.roleRepo.find({
      where: [{ tenantId }, { isSystemDefault: true }],
      relations: {
        permissions: true,
      },
      order: { isSystemRole: 'DESC', name: 'ASC' },
    })
  }

  async getRoleById(roleId: string, tenantId: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId, tenantId },
      relations: {
        permissions: true,
      },
    })
    if (!role) throw new NotFoundException(`Role ${roleId} not found`)
    return role
  }

  async createRole(
    tenantId: string,
    actorId: string,
    actorName: string,
    dto: CreateRoleDto,
  ): Promise<RoleEntity> {
    this.logger.log(`Creating role "${dto.name}" for tenant ${tenantId}`)

    const permissions = dto.permissionCodes?.length
      ? await this.permissionRepo.find({ where: { code: In(dto.permissionCodes) } })
      : []

    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description,
      tenantId,
      permissions,
      isSystemRole: false,
      isSystemDefault: false,
    })

    const saved = await this.roleRepo.save(role)

    await this.auditLogService.logRoleCreated(
      tenantId,
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
    tenantId: string,
    actorId: string,
    actorName: string,
    dto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    const role = await this.getRoleById(roleId, tenantId)

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

    await this.auditLogService.logRoleModified(tenantId, actorId, actorName, roleId, before, after)

    // Invalidate permission cache for all users assigned to this role
    await this.invalidateCacheForRoleUsers(roleId, tenantId)

    return saved
  }

  async deleteRole(
    roleId: string,
    tenantId: string,
    actorId: string,
    actorName: string,
  ): Promise<void> {
    const role = await this.getRoleById(roleId, tenantId)

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be deleted.')
    }

    await this.auditLogService.logRoleDeleted(tenantId, actorId, actorName, roleId, role.name)
    await this.invalidateCacheForRoleUsers(roleId, tenantId)
    await this.roleRepo.remove(role)
  }

  async cloneRole(
    sourceRoleId: string,
    tenantId: string,
    actorId: string,
    actorName: string,
    newName: string,
  ): Promise<RoleEntity> {
    const source = await this.getRoleById(sourceRoleId, tenantId)
    return this.createRole(tenantId, actorId, actorName, {
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
    tenantId: string,
    actorId: string,
    actorName: string,
    permissionCodes: string[],
  ): Promise<RoleEntity> {
    return this.updateRole(roleId, tenantId, actorId, actorName, { permissionCodes })
  }

  // ─────────────────────────────────────────────────────────────────
  // Tenant Bootstrap
  // ─────────────────────────────────────────────────────────────────

  /**
   * Seed the Super Admin system role for a new tenant.
   * Called during tenant creation. Gets ALL available permissions.
   * isSystemRole = true — immutable and non-deletable.
   */
  async seedSuperAdminRole(tenantId: string, manager?: EntityManager): Promise<RoleEntity> {
    const repo = getTransactionalRepo(RoleEntity, this.roleRepo, manager)
    const permRepo = getTransactionalRepo(PermissionEntity, this.permissionRepo, manager)

    const allPermissions = await permRepo.find()

    const superAdminRole = repo.create({
      name: 'Super Admin',
      description: 'Full access to all features and settings. Cannot be modified or deleted.',
      tenantId,
      isSystemRole: true,
      isSystemDefault: true,
      permissions: allPermissions,
    })

    return repo.save(superAdminRole)
  }

  /**
   * Seed the 7 default roles for a new tenant.
   * These are deletable/modifiable by the tenant admin (isSystemRole = false).
   */
  async seedDefaultRoles(tenantId: string, manager?: EntityManager): Promise<RoleEntity[]> {
    const repo = getTransactionalRepo(RoleEntity, this.roleRepo, manager)
    const permRepo = getTransactionalRepo(PermissionEntity, this.permissionRepo, manager)

    const defaultRoleDefs = DEFAULT_ROLE_DEFINITIONS

    const savedRoles: RoleEntity[] = []

    for (const def of defaultRoleDefs) {
      const existingRole = await repo.findOne({ where: { name: def.name, tenantId } })
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
        tenantId,
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
  private async invalidateCacheForRoleUsers(roleId: string, tenantId: string): Promise<void> {
    const assignments = await this.assignmentRepo.find({
      where: { roleId, tenantId },
      select: {
        userId: true,
      },
    })

    await Promise.all(
      assignments.map((a) =>
        this.permissionResolutionService.invalidateUserPermissionCache(a.userId, tenantId),
      ),
    )
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Catalog Query
  // ─────────────────────────────────────────────────────────────────

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepo.find({
      order: { module: 'ASC', feature: 'ASC', action: 'ASC' },
    })
  }

  async getPermissionsByFeature(): Promise<Record<string, PermissionEntity[]>> {
    const permissions = await this.getAllPermissions()
    return permissions.reduce(
      (acc, p) => {
        const key = p.feature || p.module
        if (!acc[key]) acc[key] = []
        acc[key].push(p)
        return acc
      },
      {} as Record<string, PermissionEntity[]>,
    )
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
