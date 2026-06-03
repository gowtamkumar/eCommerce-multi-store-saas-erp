import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, from } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'
import { sanitizeAuditValue } from 'src/modules/system/audit-log/audit-log-sanitizer.util'
import { AuditLogService } from 'src/modules/system/audit-log/audit-log.service'
import { DataSource } from 'typeorm'
import { AUDIT_METADATA_KEY, AuditOptions } from '../decorators/audit.decorator'

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

    // GATEKEEPER: If no audit decorator, skip immediately
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

    const emit = (oldValue: Record<string, any> | null): Observable<any> =>
      next.handle().pipe(
        tap(async () => {
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

          // Log asynchronously (service handles errors internally)
          if (tenantId) {
            const ctx = {
              tenantId,
              userId: user?.id,
              user,
              branchId,
              warehouseId,
            } as any
            await this.auditLogService.log(ctx, auditData)
          }
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
