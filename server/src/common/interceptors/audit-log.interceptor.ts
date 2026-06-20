import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, from, of } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'
import { sanitizeAuditValue } from 'src/modules/system/audit-log/audit-log-sanitizer.util'
import { AuditLogService } from 'src/modules/system/audit-log/audit-log.service'
import { DataSource } from 'typeorm'
import { AUDIT_METADATA_KEY, AuditOptions } from '../decorators/audit.decorator'

/**
 * Intercepts decorated routes and writes a structured audit log entry.
 *
 * Performance design:
 *
 * 1. `loadOldValue()` — still runs BEFORE the handler so we can capture the pre-mutation
 *    state (needed for UPDATE/DELETE diffs). This is a single targeted PK lookup and is
 *    acceptable on mutation routes. It is skipped entirely on CREATE routes.
 *
 * 2. `auditLogService.log()` — runs AFTER the handler responds, inside `tap()`. The DB write
 *    is deferred with `setImmediate()` so it executes in the next event-loop tick AFTER the
 *    HTTP response has been flushed to the client. The caller never `await`s it. This means
 *    audit write latency is completely invisible to API response time.
 *
 * 3. `loadOldValue()` errors are silently swallowed — audit logging NEVER blocks or fails a
 *    business request.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler()
    const controller = context.getClass()

    // Check for Audit decorator on method or class
    const auditOptions = this.reflector.getAllAndOverride<AuditOptions>(AUDIT_METADATA_KEY, [
      handler,
      controller,
    ])

    // GATEKEEPER: If no audit decorator, skip immediately — zero overhead
    if (!auditOptions) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const { method, ip, user, headers } = request

    // Extract tenant ID, branch ID, and warehouse ID
    const tenantId = request.tenantId || headers['x-tenant-id']
    const branchId = request.branchId || headers['x-branch-id'] || request.body?.branchId || null
    const warehouseId =
      request.warehouseId || headers['x-warehouse-id'] || request.body?.warehouseId || null

    const action = auditOptions.action || this.mapMethodToAction(method)
    const entityId = request.params?.id || request.body?.id

    /**
     * Build the observable that runs the handler and fires the audit write.
     *
     * @param oldValue - The entity state captured before the handler ran (null on CREATE).
     */
    const emit = (oldValue: Record<string, any> | null): Observable<any> =>
      next.handle().pipe(
        tap(() => {
          // Guard: no tenantId = nothing to audit
          if (!tenantId) return

          const auditData = {
            userId: user?.id,
            action,
            entity: auditOptions.entity,
            entityId,
            branchId,
            warehouseId,
            // Snapshot of the entity before the change (UPDATE/DELETE). Null on CREATE.
            oldValue: oldValue ? sanitizeAuditValue(oldValue) : null,
            // Audit payloads must never persist credentials or secrets.
            newValue: method !== 'DELETE' ? sanitizeAuditValue(request.body) : null,
            ipAddress: ip,
            userAgent: headers['user-agent'],
          }

          const ctx = {
            tenantId,
            userId: user?.id,
            user,
            branchId,
            warehouseId,
          } as any

          // ── Fire-and-forget audit write ────────────────────────────────
          // Defer to the next event-loop tick so this NEVER adds latency to
          // the HTTP response. The client receives its response first; the DB
          // insert happens in the background. Errors are swallowed internally
          // by AuditLogService.log() so they can never surface to the caller.
          setImmediate(() => {
            this.auditLogService.log(ctx, auditData).catch((err) => {
              this.logger.warn(
                `[AuditLog] Background write failed for ${action} on ${auditOptions.entity}: ${err?.message}`,
              )
            })
          })
        }),
      )

    // Capture the prior state BEFORE the handler mutates/removes it. Only meaningful
    // when we are acting on an existing record (an :id is present) and the action is
    // not a plain create. Failures here must never block the request.
    const shouldLoadOld = !!entityId && action !== 'CREATE' && action !== 'REGISTER'
    if (!shouldLoadOld) {
      return emit(null)
    }

    return from(this.loadOldValue(auditOptions.entity, entityId, tenantId)).pipe(
      switchMap((oldValue) => emit(oldValue)),
    )
  }

  /**
   * Resolves the prior persisted state of an entity by its declared audit name and id.
   * The audit `entity` string (e.g. "Brand") is matched against the TypeORM entity
   * class name (e.g. "BrandEntity"). Tenant scoping is applied when the entity carries
   * a `tenantId` column. Returns null when the entity cannot be resolved or found, so
   * audit logging degrades gracefully instead of throwing.
   */
  private async loadOldValue(
    entityName: string,
    id: string,
    tenantId?: string,
  ): Promise<Record<string, any> | null> {
    try {
      const metadata = this.dataSource.entityMetadatas.find(
        (m) => m.name === entityName || m.name === `${entityName}Entity`,
      )
      if (!metadata) return null

      const where: Record<string, any> = { id }
      const hasTenantColumn = metadata.columns.some((c) => c.propertyName === 'tenantId')
      if (hasTenantColumn && tenantId) {
        where.tenantId = tenantId
      }

      const repo = this.dataSource.getRepository(metadata.target)
      const existing = await repo.findOne({ where })
      return (existing as Record<string, any>) ?? null
    } catch (err) {
      this.logger.warn(
        `Failed to load oldValue for ${entityName}#${id}: ${(err as Error)?.message}`,
      )
      return null
    }
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE'
      case 'PUT':
      case 'PATCH':
        return 'UPDATE'
      case 'DELETE':
        return 'DELETE'
      default:
        return method
    }
  }
}
