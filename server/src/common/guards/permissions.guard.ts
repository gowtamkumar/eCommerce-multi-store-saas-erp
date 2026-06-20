import { UserService } from '@/modules/admin/core/user/services/user.service'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import * as jwt from 'jsonwebtoken'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { UserRole } from '../enums/user/user-role.enum'
import { PermissionResolutionService } from '../services/permission-resolution.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly resolutionService: PermissionResolutionService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 0. Bypass for @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // No permissions declared on this route → open to any authenticated user
    if (!requiredPermissions || requiredPermissions.length === 0) return true

    const request = context.switchToHttp().getRequest()
    let { user } = request

    // Attempt to resolve user from JWT if not already set by JwtAuthGuard
    if (!user) {
      const authHeader = request.headers['authorization']
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const secret = this.configService.get('JWT_SECRET_KEY')
          const decoded = jwt.verify(token, secret) as any
          if (decoded?.sub) {
            user = await this.userService.getUser(decoded.sub)
            request.user = user
          }
        } catch {
          // Ignore — fall through to the auth failure below
        }
      }
    }

    if (!user) return false

    const userRole = user.role || ''
    const isGlobalAdmin = userRole.toLowerCase() === UserRole.SUPER_ADMIN

    // 1. Platform admins bypass all dynamic permission checks.
    // Tenant admins are intentionally resolved through RBAC so custom roles and
    // explicit DENY overrides still apply.
    if (isGlobalAdmin) return true

    const tenantId = user.tenantId
    if (!tenantId) {
      throw new ForbiddenException('User is not associated with a tenant.')
    }

    // 2. Load the cached manifest once and check ALL required permissions in a single
    //    Redis round-trip. This replaces the previous N×5 DB-query loop:
    //      Old: for each perm → resolvePermission() → 5-6 DB queries each
    //      New: resolvePermissionsFromManifest() → 1 Redis lookup, 0 DB queries on cache hit
    const { denied } = await this.resolutionService.resolvePermissionsFromManifest(
      user.id,
      tenantId,
      requiredPermissions,
    )

    if (denied !== null) {
      // Log the failed access attempt
      await this.auditLogService.logPermissionCheckFailed(
        tenantId,
        user.id,
        denied,
        `Access denied to route: ${request.method} ${request.url}`,
      )
      throw new ForbiddenException(
        `Access Denied: You do not have the required permission (${denied}) to perform this action.`,
      )
    }

    return true
  }
}
