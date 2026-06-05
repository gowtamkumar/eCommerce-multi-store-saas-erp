import { getTransactionalRepo } from '@/common/utils/repository.util'
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

    const defaultRoleDefs: Array<{
      name: string
      description: string
      permCodes: string[]
    }> = [
      {
        name: 'Branch Manager',
        description: 'Full operational control across the tenant.',
        permCodes: [
          // POS
          'pos:create-sale',
          'pos:manage-shifts',
          'pos:override-price',
          'pos:apply-discount',
          'pos:void-transaction',
          'pos:refund-sale',
          'pos:manage-cash-drawer',
          'pos:view-reports',
          // Catalog
          'catalog:read',
          'catalog:write',
          'catalog:publish',
          'catalog:featured',
          // Inventory
          'inventory:read',
          'inventory:write',
          'inventory:adjust',
          'inventory:transfer',
          'inventory:cycle-count',
          'inventory:report',
          // Procurement
          'purchasing:read',
          'purchasing:write',
          'purchasing:approve',
          'purchasing:receive-grn',
          'supplier:manage',
          'supplier:view-pricing',
          // Sales & Orders
          'orders:read',
          'orders:write',
          'orders:cancel',
          'orders:approve',
          'orders:export',
          'returns:read',
          'returns:write',
          'returns:approve',
          // HRM (Operations)
          'hrm:clock-attendance',
          'hrm:view-attendance-report',
          'hrm:manage-employees',
          'hrm:approve-leave',
          'hrm:manage-documents',
          // Finance & Accounting
          'finance:read-ledger',
          'finance:write-expense',
          'accounting:read',
          'accounting:write',
          'invoices:manage',
          // Reporting
          'reports:read',
          'reports:export',
          'reports:schedule',
          // Team & CRM
          'users:read',
          'users:invite',
          'crm:read',
          'crm:write',
          'crm:segment',
          // Logistics
          'fulfillment:manage',
          // Settings
          'settings:manage',
        ],
      },
      {
        name: 'Accountant',
        description: 'Financial, general ledger, and reconciliation control.',
        permCodes: [
          'finance:read-ledger',
          'finance:write-expense',
          'finance:post-journal',
          'finance:reverse-journal',
          'finance:close-period',
          'finance:manage-budget',
          'accounting:read',
          'accounting:write',
          'accounting:manage-coa',
          'invoices:manage',
          'invoices:approve',
          'payments:read',
          'payments:write',
          'payments:reconcile',
          'reports:read',
          'reports:view-financial',
          'reports:export',
          'purchasing:read',
          'supplier:view-pricing',
        ],
      },
      {
        name: 'Sales Associate',
        description: 'Standard retail sales and checkout operator.',
        permCodes: [
          'pos:create-sale',
          'inventory:read',
          'orders:read',
          'orders:write',
          'returns:read',
          'catalog:read',
          'crm:read',
          'payments:read',
          'hrm:clock-attendance',
        ],
      },
      {
        name: 'HR Manager',
        description: 'Comprehensive human resources, employee file, and payroll management.',
        permCodes: [
          'hrm:clock-attendance',
          'hrm:correct-attendance',
          'hrm:view-attendance-report',
          'hrm:process-payroll',
          'hrm:approve-payroll',
          'hrm:view-payslip',
          'hrm:manage-employees',
          'hrm:delete-employee',
          'hrm:approve-leave',
          'hrm:manage-documents',
          'users:read',
          'reports:read',
        ],
      },
      {
        name: 'Procurement Officer',
        description: 'Purchase orders, stock receipts, and supplier contract manager.',
        permCodes: [
          'purchasing:read',
          'purchasing:write',
          'purchasing:approve',
          'purchasing:receive-grn',
          'inventory:read',
          'supplier:manage',
          'supplier:view-pricing',
          'reports:read',
        ],
      },
      {
        name: 'Inventory Manager',
        description: 'Warehouse movement, stock adjustments, and carrier logistics controller.',
        permCodes: [
          'inventory:read',
          'inventory:write',
          'inventory:adjust',
          'inventory:transfer',
          'inventory:cycle-count',
          'inventory:report',
          'catalog:read',
          'reports:read',
          'fulfillment:manage',
          'logistics:manage',
          'shipping:manage',
        ],
      },
      {
        name: 'Viewer',
        description: 'Full read-only auditing and observation access.',
        permCodes: [
          'catalog:read',
          'inventory:read',
          'purchasing:read',
          'orders:read',
          'returns:read',
          'payments:read',
          'finance:read-ledger',
          'accounting:read',
          'crm:read',
          'reports:read',
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
