import { Injectable, Logger } from '@nestjs/common'
import { AuditLogRepository } from './audit-log.repository'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { QueryAuditLogDto } from './dto/query-audit-log.dto'
import { AuditLogEntity } from './entities/audit-log.entity'

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name)

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Programmatically log an action from any service.
   * Errors are swallowed so audit logging never breaks business logic.
   */
  async log(
    tenantId: string,
    dto: CreateAuditLogDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    this.logger.log(`${this.log.name} Service Called`)
    try {
      await this.auditLogRepository.createAndSave(tenantId, {
        userId: dto.userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        ipAddress: dto.ipAddress ?? ipAddress,
        userAgent: dto.userAgent ?? userAgent,
      })
    } catch (err) {
      // Never let audit logging break the main request flow
      console.error('[AuditLog] Failed to write audit log:', err?.message)
    }
  }

  /**
   * Paginated list with optional filters — tenant-scoped always.
   */
  async findAllAuditLogs(
    tenantId: string,
    query: QueryAuditLogDto,
  ): Promise<{ data: AuditLogEntity[]; meta: any }> {
    this.logger.log(`${this.findAllAuditLogs.name} Service Called`)
    const { page = 1, limit = 20, userId, action, entity, entityId, from, to } = query
    const [data, total] = await this.auditLogRepository.findAllWithFilters(tenantId, {
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
  async findOneAuditLog(id: string, tenantId: string): Promise<AuditLogEntity | null> {
    this.logger.log(`${this.findOneAuditLog.name} Service Called`)
    return await this.auditLogRepository.findById(id, tenantId)
  }

  /**
   * Delete all logs older than N days for a tenant (data-retention helper).
   */
  async deleteOlderThanAuditLogs(
    tenantId: string,
    days: number,
  ): Promise<{ message: string }> {
    this.logger.log(`${this.deleteOlderThanAuditLogs.name} Service Called`)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    await this.auditLogRepository.deleteOlderThan(tenantId, cutoff)

    return { message: `Audit logs older than ${days} days deleted for tenant ${tenantId}` }
  }
}
