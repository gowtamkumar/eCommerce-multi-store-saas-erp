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
 * Manages the assignment of roles to users within a store.
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

  async getUserRoles(userId: string, storeId: string): Promise<UserRoleAssignmentEntity[]> {
    const now = new Date()
    const assignments = await this.assignmentRepo.find({
      where: { userId, storeId },
      relations: {
        role: true,
      },
    })

    // Filter out expired assignments
    return assignments.filter((a) => !a.expiresAt || new Date(a.expiresAt) > now)
  }

  async assignRoleToUser(
    targetUserId: string,
    storeId: string,
    actorId: string,
    actorName: string,
    dto: AssignRoleDto,
  ): Promise<UserRoleAssignmentEntity> {
    this.logger.log(`Assigning role ${dto.roleId} to user ${targetUserId} in store ${storeId}`)

    // 1. Validate user and role exist in this store
    const user = await this.userRepo.findOne({ where: { id: targetUserId, storeId } })
    if (!user) throw new NotFoundException('User not found in this store')

    const role = await this.roleRepo.findOne({ where: { id: dto.roleId, storeId: storeId } })
    // If storeId on role is null, it might be a system default role (if we supported cross-store defaults, but we seed per store, so it should match or be system default)
    // For now, let's assume all roles (even system) are seeded per store.
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
      storeId,
      scopeType: dto.scopeType,
      scopeId: dto.scopeId ?? null,
      assignedBy: actorId,
      expiresAt: dto.expiresAt ?? null,
    })

    const saved = await this.assignmentRepo.save(assignment)

    const roleWithPerms = await this.roleRepo.findOne({
      where: { id: dto.roleId },
      relations: { permissions: true },
    })
    if (roleWithPerms?.permissions?.length) {
      await this.permissionResolutionService.ensureStoreFeaturesForPermissionSlugs(
        storeId,
        roleWithPerms.permissions.map((p) => p.code),
      )
    }

    // 4. Audit & Cache Invalidation
    await this.auditLogService.logUserRoleAssigned(
      storeId,
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

    await this.permissionResolutionService.invalidateUserPermissionCache(targetUserId, storeId)

    return saved
  }

  async revokeRoleFromUser(
    assignmentId: string,
    storeId: string,
    actorId: string,
    actorName: string,
    reason?: string,
  ): Promise<void> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, storeId },
    })

    if (!assignment) throw new NotFoundException('Role assignment not found')

    await this.auditLogService.logUserRoleRevoked(
      storeId,
      actorId,
      actorName,
      assignment.userId,
      assignment.roleId,
      reason,
    )

    await this.assignmentRepo.remove(assignment)
    await this.permissionResolutionService.invalidateUserPermissionCache(
      assignment.userId,
      storeId,
    )
  }
}
