import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

export interface AssignRoleDto {
  roleId: string
  scopeType: RoleScopeType
  scopeId?: string
  expiresAt?: Date
}

/**
 * Manages the assignment of roles to users within a tenant.
 * Handles scope validation and multi-role assignments.
 */
@Injectable()
export class UserRoleAssignmentService {
  private readonly logger = new Logger(UserRoleAssignmentService.name)

  constructor(
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly assignmentRepo: Repository<UserRoleAssignmentEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    private readonly auditLogService: AuditLogService,
    private readonly permissionResolutionService: PermissionResolutionService,
  ) {}

  async getUserRoles(userId: string, tenantId: string): Promise<UserRoleAssignmentEntity[]> {
    const now = new Date()
    const assignments = await this.assignmentRepo.find({
      where: { userId, tenantId },
      relations: {
        role: true,
      },
    })

    // Filter out expired assignments
    return assignments.filter((a) => !a.expiresAt || new Date(a.expiresAt) > now)
  }

  async assignRoleToUser(
    targetUserId: string,
    tenantId: string,
    actorId: string,
    actorName: string,
    dto: AssignRoleDto,
  ): Promise<UserRoleAssignmentEntity> {
    this.logger.log(`Assigning role ${dto.roleId} to user ${targetUserId} in tenant ${tenantId}`)

    // 1. Validate user and role exist in this tenant
    const user = await this.userRepo.findOne({ where: { id: targetUserId, tenantId } })
    if (!user) throw new NotFoundException('User not found in this tenant')

    const role = await this.roleRepo.findOne({ where: { id: dto.roleId, tenantId: tenantId } })
    // If tenantId on role is null, it might be a system default role (if we supported cross-tenant defaults, but we seed per tenant, so it should match or be system default)
    // For now, let's assume all roles (even system) are seeded per tenant.
    if (
      !role &&
      !(await this.roleRepo.findOne({ where: { id: dto.roleId, isSystemDefault: true } }))
    ) {
      throw new NotFoundException('Role not found')
    }

    // 2. Prevent duplicate active assignments of the same role+scope
    const existing = await this.assignmentRepo.findOne({
      where: {
        userId: targetUserId,
        roleId: dto.roleId,
        scopeId: dto.scopeId ?? null,
      },
    })

    if (existing) {
      if (!existing.expiresAt || new Date(existing.expiresAt) > new Date()) {
        throw new ConflictException('User already has this role active in this scope')
      } else {
        // If expired, we can just delete it and recreate, or update it
        await this.assignmentRepo.remove(existing)
      }
    }

    // 3. Create assignment
    const assignment = this.assignmentRepo.create({
      userId: targetUserId,
      roleId: dto.roleId,
      tenantId,
      scopeType: dto.scopeType,
      scopeId: dto.scopeId ?? null,
      assignedBy: actorId,
      expiresAt: dto.expiresAt ?? null,
    })

    const saved = await this.assignmentRepo.save(assignment)

    // 4. Audit & Cache Invalidation
    await this.auditLogService.logUserRoleAssigned(
      tenantId,
      actorId,
      actorName,
      targetUserId,
      dto.roleId,
      {
        scopeType: dto.scopeType,
        scopeId: dto.scopeId,
        expiresAt: dto.expiresAt,
      },
    )

    await this.permissionResolutionService.invalidateUserPermissionCache(targetUserId, tenantId)

    return saved
  }

  async revokeRoleFromUser(
    assignmentId: string,
    tenantId: string,
    actorId: string,
    actorName: string,
    reason?: string,
  ): Promise<void> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, tenantId },
    })

    if (!assignment) throw new NotFoundException('Role assignment not found')

    await this.auditLogService.logUserRoleRevoked(
      tenantId,
      actorId,
      actorName,
      assignment.userId,
      assignment.roleId,
      reason,
    )

    await this.assignmentRepo.remove(assignment)
    await this.permissionResolutionService.invalidateUserPermissionCache(
      assignment.userId,
      tenantId,
    )
  }
}
