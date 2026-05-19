import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { AuditLogService } from 'src/modules/system/audit-log/audit-log.service'
import { AUDIT_METADATA_KEY, AuditOptions } from '../decorators/audit.decorator'

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
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
    const { method, url, ip, user, headers } = request

    // Extract tenant ID, branch ID, and warehouse ID
    const tenantId = request.tenantId || headers['x-tenant-id']
    const branchId = request.branchId || headers['x-branch-id'] || request.body?.branchId || null
    const warehouseId = request.warehouseId || headers['x-warehouse-id'] || request.body?.warehouseId || null

    return next.handle().pipe(
      tap(async () => {
        // Determine action if not explicitly provided in decorator
        const action = auditOptions.action || this.mapMethodToAction(method)

        // Prepare audit log data
        const auditData = {
          userId: user?.id,
          action,
          entity: auditOptions.entity,
          entityId: request.params?.id || request.body?.id,
          branchId,
          warehouseId,
          // For now, we log the request body as newValue for mutations
          // In a more complex setup, we could compare old and new state
          newValue: method !== 'DELETE' ? request.body : null,
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
