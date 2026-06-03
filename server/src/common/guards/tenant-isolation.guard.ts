import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import * as jwt from 'jsonwebtoken'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { UserRole } from '../enums/user/user-role.enum'

/**
 * Prevents cross-tenant access. The active tenant is taken from the
 * client-supplied `x-tenant-id` header, so we must verify it matches the
 * tenant baked into the authenticated user's JWT. Without this, any logged-in
 * user could read/write another tenant's data by swapping the header.
 *
 * This runs as a global guard, before the controller-scoped JwtAuthGuard, so
 * it decodes the bearer token itself (mirroring PermissionsGuard).
 */
@Injectable()
export class TenantIsolationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()

    // Tenant context the request is trying to act on (set by TenantContextMiddleware).
    const headerTenantId =
      request.tenantId || (request.headers['x-tenant-id'] as string) || null

    // Resolve the authenticated identity from the bearer token. Unauthenticated
    // (public/storefront) requests have no token — leave them to other guards.
    const authHeader = request.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
      return true
    }

    let decoded: { tenantId?: string | null; role?: string } | null = null
    try {
      const secret = this.configService.get('JWT_SECRET_KEY')
      decoded = jwt.verify(authHeader.substring(7), secret) as any
    } catch {
      // Invalid/expired token — authentication guards will reject it.
      return true
    }

    // Super admins legitimately operate across every tenant.
    if (decoded?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    const userTenantId = decoded?.tenantId
    // Token without a tenant (e.g. platform-level), or no tenant context to
    // validate against — nothing to compare here.
    if (!userTenantId || !headerTenantId) {
      return true
    }

    if (userTenantId !== headerTenantId) {
      throw new ForbiddenException({
        success: false,
        message: 'Tenant context mismatch: you are not allowed to access this store.',
      })
    }

    return true
  }
}
