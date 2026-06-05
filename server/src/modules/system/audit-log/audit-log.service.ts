import { Injectable, Logger } from '@nestjs/common'
import { AuditLogRepository } from './audit-log.repository'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { QueryAuditLogDto } from './dto/query-audit-log.dto'
import { AuditLogEntity } from './entities/audit-log.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { sanitizeAuditValue } from './audit-log-sanitizer.util'

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name)

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Programmatically log an action from any service.
   * Errors are swallowed so audit logging never breaks business logic.
   */
  async log(
    ctx: RequestContextDto,
    dto: CreateAuditLogDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    this.logger.log(`${this.log.name} Service Called`)
    try {
      await this.auditLogRepository.createAndSave(ctx, {
        userId: dto.userId ?? ctx.userId,
        actorId: dto.userId ?? ctx.userId ?? null,
        actorName: (dto as any).actorName ?? null,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        oldValue: sanitizeAuditValue(dto.oldValue),
        newValue: sanitizeAuditValue(dto.newValue),
        ipAddress: dto.ipAddress ?? ipAddress,
        userAgent: dto.userAgent ?? userAgent,
      } as any)
    } catch (err: any) {
      // Never let audit logging break the main request flow
      console.error('[AuditLog] Failed to write audit log:', err?.message)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission-Specific Typed Audit Methods
  // ─────────────────────────────────────────────────────────────────

  /** Fired when a tenant admin creates a new role */
  async logRoleCreated(
    tenantId: string,
    actorId: string,
    actorName: string,
    roleId: string,
    roleName: string,
    permissionSlugs: string[],
  ): Promise<void> {
    await this.safeLog(tenantId, actorId, actorName, 'ROLE_CREATED', 'Role', roleId, null, {
      name: roleName,
      permissions: permissionSlugs,
    })
  }

  /** Fired when a role's name, description, or permission set changes */
  async logRoleModified(
    tenantId: string,
    actorId: string,
    actorName: string,
    roleId: string,
    before: Record<string, any>,
    after: Record<string, any>,
  ): Promise<void> {
    await this.safeLog(tenantId, actorId, actorName, 'ROLE_MODIFIED', 'Role', roleId, before, after)
  }

  /** Fired when a role is deleted */
  async logRoleDeleted(
    tenantId: string,
    actorId: string,
    actorName: string,
    roleId: string,
    roleName: string,
  ): Promise<void> {
    await this.safeLog(
      tenantId,
      actorId,
      actorName,
      'ROLE_DELETED',
      'Role',
      roleId,
      { name: roleName },
      null,
    )
  }

  /** Fired when a role is assigned to a user */
  async logUserRoleAssigned(
    tenantId: string,
    actorId: string,
    actorName: string,
    targetUserId: string,
    roleId: string,
    scope: { scopeType: string; scopeId?: string | null; expiresAt?: Date | null },
  ): Promise<void> {
    await this.safeLog(
      tenantId,
      actorId,
      actorName,
      'USER_ROLE_ASSIGNED',
      'UserRoleAssignment',
      `${targetUserId}:${roleId}`,
      null,
      { targetUserId, roleId, ...scope },
    )
  }

  /** Fired when a role is revoked from a user */
  async logUserRoleRevoked(
    tenantId: string,
    actorId: string,
    actorName: string,
    targetUserId: string,
    roleId: string,
    reason?: string,
  ): Promise<void> {
    await this.safeLog(
      tenantId,
      actorId,
      actorName,
      'USER_ROLE_REVOKED',
      'UserRoleAssignment',
      `${targetUserId}:${roleId}`,
      { targetUserId, roleId },
      { reason: reason ?? null },
    )
  }

  /** Fired when an explicit allow/deny override is added to a user */
  async logPermissionOverrideAdded(
    tenantId: string,
    actorId: string,
    actorName: string,
    targetUserId: string,
    permissionSlug: string,
    effect: string,
    reason: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await this.safeLog(
      tenantId,
      actorId,
      actorName,
      'PERMISSION_OVERRIDE_ADDED',
      'UserPermissionOverride',
      `${targetUserId}:${permissionSlug}`,
      null,
      { targetUserId, permissionSlug, effect, reason, expiresAt },
    )
  }

  /** Fired when an override is removed */
  async logPermissionOverrideRemoved(
    tenantId: string,
    actorId: string,
    actorName: string,
    overrideId: string,
    targetUserId: string,
    permissionSlug: string,
  ): Promise<void> {
    await this.safeLog(
      tenantId,
      actorId,
      actorName,
      'PERMISSION_OVERRIDE_REMOVED',
      'UserPermissionOverride',
      overrideId,
      { targetUserId, permissionSlug },
      null,
    )
  }

  /**
   * Fired when a permission check fails — useful for security monitoring
   * to detect suspicious access attempts or misconfigured roles.
   */
  async logPermissionCheckFailed(
    tenantId: string,
    userId: string,
    permissionSlug: string,
    reason?: string,
  ): Promise<void> {
    await this.safeLog(
      tenantId,
      userId,
      null,
      'PERMISSION_CHECK_FAILED',
      'Permission',
      permissionSlug,
      null,
      { userId, permissionSlug, reason: reason ?? 'Access denied' },
    )
  }

  // ─────────────────────────────────────────────────────────────────
  // Generic Queries
  // ─────────────────────────────────────────────────────────────────

  /**
   * Paginated list with optional filters — tenant-scoped always.
   */
  async findAllAuditLogs(
    ctx: RequestContextDto,
    query: QueryAuditLogDto,
  ): Promise<{ data: AuditLogEntity[]; meta: any }> {
    this.logger.log(`${this.findAllAuditLogs.name} Service Called`)

    // Scoping check: If super_admin or admin role, allow querying by any tenantId (or all if omitted).
    // Otherwise, strictly force tenantId to be the user's tenantId.
    const userRole = ctx.user?.role || ''
    const isGlobalAdmin = userRole.toLowerCase() === 'super_admin'

    let targetTenantId: string | null = ctx.tenantId
    if (isGlobalAdmin) {
      targetTenantId = query.tenantId ?? null
    }

    const { page = 1, limit = 20, userId, action, entity, entityId, from, to } = query
    const [data, total] = await this.auditLogRepository.findAllWithFilters(targetTenantId, {
      page,
      limit,
      userId,
      action,
      entity,
      entityId,
      from,
      to,
    })

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Single audit log entry — tenant-scoped.
   */
  async findOneAuditLog(id: string, ctx: RequestContextDto): Promise<AuditLogEntity | null> {
    this.logger.log(`${this.findOneAuditLog.name} Service Called`)
    const userRole = ctx.user?.role || ''
    const isGlobalAdmin = userRole.toLowerCase() === 'super_admin'

    const targetTenantId = isGlobalAdmin ? null : ctx.tenantId
    return await this.auditLogRepository.findById(id, targetTenantId)
  }

  /**
   * Delete all logs older than N days for a tenant (data-retention helper).
   */
  async deleteOlderThanAuditLogs(
    ctx: RequestContextDto,
    days: number,
  ): Promise<{ message: string }> {
    this.logger.log(`${this.deleteOlderThanAuditLogs.name} Service Called`)
    const { tenantId } = ctx
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    await this.auditLogRepository.deleteOlderThan(tenantId, cutoff)

    return { message: `Audit logs older than ${days} days deleted for tenant ${tenantId}` }
  }

  // ─────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────

  private async safeLog(
    tenantId: string,
    actorId: string,
    actorName: string | null,
    action: string,
    entity: string,
    entityId: string,
    oldValue: Record<string, any> | null,
    newValue: Record<string, any> | null,
  ): Promise<void> {
    try {
      await this.auditLogRepository.createAndSave(
        { tenantId } as RequestContextDto,
        {
          userId: actorId,
          actorId,
          actorName,
          action,
          entity,
          entityId,
          oldValue: sanitizeAuditValue(oldValue),
          newValue: sanitizeAuditValue(newValue),
        } as any,
      )
    } catch (err: any) {
      console.error('[AuditLog] Failed to write permission audit log:', err?.message)
    }
  }
}
