import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { RiskLevel } from '@/common/enums/risk-level.enum'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

export interface CreateRoleDto {
  name: string
  description?: string
  permissionCodes?: string[]
  parentRoleId?: string
  scopeType?: RoleScopeType
}

export interface UpdateRoleDto {
  name?: string
  description?: string
  permissionCodes?: string[]
  parentRoleId?: string | null
  scopeType?: RoleScopeType
}

/**
 * Manages the lifecycle of roles within a tenant.
 * Enforces the rule that system roles (isSystemRole=true) cannot be modified or deleted.
 */
@Injectable()
export class RoleManagementService {
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

  // ─────────────────────────────────────────────────────────────────
  // Role CRUD
  // ─────────────────────────────────────────────────────────────────

  async getAllRoles(tenantId: string): Promise<RoleEntity[]> {
    return this.roleRepo.find({
      where: [{ tenantId }, { isSystemDefault: true }],
      relations: ['permissions', 'parentRole'],
      order: { isSystemRole: 'DESC', name: 'ASC' },
    })
  }

  async getRoleById(roleId: string, tenantId: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId, tenantId },
      relations: ['permissions', 'parentRole'],
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
      scopeType: (dto.scopeType ? dto.scopeType.toLowerCase() as RoleScopeType : RoleScopeType.GLOBAL),
      parentRoleId: dto.parentRoleId ?? null,
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
      parentRoleId: role.parentRoleId,
      scopeType: role.scopeType,
    }

    if (dto.name !== undefined) role.name = dto.name
    if (dto.description !== undefined) role.description = dto.description
    if (dto.scopeType !== undefined) role.scopeType = dto.scopeType.toLowerCase() as RoleScopeType
    if (dto.parentRoleId !== undefined) role.parentRoleId = dto.parentRoleId

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
      parentRoleId: saved.parentRoleId,
      scopeType: saved.scopeType,
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
      scopeType: source.scopeType,
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
  async seedSuperAdminRole(tenantId: string, manager?: any): Promise<RoleEntity> {
    const repo = manager ? manager.getRepository(RoleEntity) : this.roleRepo
    const permRepo = manager ? manager.getRepository(PermissionEntity) : this.permissionRepo

    const allPermissions = await permRepo.find()

    const superAdminRole = repo.create({
      name: 'Super Admin',
      description: 'Full access to all features and settings. Cannot be modified or deleted.',
      tenantId,
      isSystemRole: true,
      isSystemDefault: true,
      scopeType: RoleScopeType.GLOBAL,
      permissions: allPermissions,
    })

    return repo.save(superAdminRole)
  }

  /**
   * Seed the 7 default roles for a new tenant.
   * These are deletable/modifiable by the tenant admin (isSystemRole = false).
   */
  async seedDefaultRoles(tenantId: string, manager?: any): Promise<RoleEntity[]> {
    const repo = manager ? manager.getRepository(RoleEntity) : this.roleRepo
    const permRepo = manager ? manager.getRepository(PermissionEntity) : this.permissionRepo

    const defaultRoleDefs: Array<{
      name: string
      description: string
      scopeType: RoleScopeType
      permCodes: string[]
    }> = [
      {
        name: 'Branch Manager',
        description: 'Full access scoped to their assigned branch.',
        scopeType: RoleScopeType.BRANCH,
        permCodes: [
          'pos:create-sale', 'pos:manage-shifts',
          'inventory:read', 'inventory:write',
          'orders:read', 'orders:write',
          'returns:read', 'returns:write',
          'hrm:manage-employees', 'hrm:clock-attendance', 'hrm:process-payroll',
          'finance:read-ledger', 'finance:write-expense',
          'purchasing:read', 'purchasing:write',
          'accounting:read', 'accounting:write',
          'reports:read',
          'users:read', 'users:invite',
          'catalog:read', 'catalog:write',
          'crm:read', 'crm:write',
          'settings:manage',
          'invoices:manage',
          'fulfillment:manage',
        ],
      },
      {
        name: 'Accountant',
        description: 'Finance and accounting access.',
        scopeType: RoleScopeType.GLOBAL,
        permCodes: [
          'finance:read-ledger', 'finance:write-expense',
          'accounting:read', 'accounting:write',
          'invoices:manage',
          'payments:read',
          'reports:read',
          'purchasing:read',
        ],
      },
      {
        name: 'Sales Associate',
        description: 'POS sales and basic inventory view.',
        scopeType: RoleScopeType.BRANCH,
        permCodes: [
          'pos:create-sale',
          'inventory:read',
          'orders:read', 'orders:write',
          'returns:read',
          'catalog:read',
          'crm:read',
          'payments:read',
          'hrm:clock-attendance',
        ],
      },
      {
        name: 'HR Manager',
        description: 'Full HRM access including payroll.',
        scopeType: RoleScopeType.GLOBAL,
        permCodes: [
          'hrm:manage-employees', 'hrm:clock-attendance', 'hrm:process-payroll',
          'users:read',
          'reports:read',
        ],
      },
      {
        name: 'Procurement Officer',
        description: 'Purchase orders, GRN, and supplier management.',
        scopeType: RoleScopeType.GLOBAL,
        permCodes: [
          'purchasing:read', 'purchasing:write',
          'inventory:read',
          'supplier:manage',
          'reports:read',
        ],
      },
      {
        name: 'Inventory Manager',
        description: 'Full inventory control including stock adjustments.',
        scopeType: RoleScopeType.WAREHOUSE,
        permCodes: [
          'inventory:read', 'inventory:write',
          'catalog:read',
          'reports:read',
          'fulfillment:manage',
          'logistics:manage',
        ],
      },
      {
        name: 'Viewer',
        description: 'Read-only access to all modules.',
        scopeType: RoleScopeType.GLOBAL,
        permCodes: [
          'pos:create-sale',
          'inventory:read',
          'orders:read',
          'returns:read',
          'catalog:read',
          'crm:read',
          'finance:read-ledger',
          'accounting:read',
          'purchasing:read',
          'reports:read',
          'payments:read',
          'users:read',
        ],
      },
    ]

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
        scopeType: def.scopeType,
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
      select: ['userId'],
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
