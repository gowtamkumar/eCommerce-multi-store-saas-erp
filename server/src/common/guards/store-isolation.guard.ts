import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import * as jwt from 'jsonwebtoken'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { UserRole } from '../enums/user/user-role.enum'

/**
 * Prevents cross-store access. The active store is taken from the
 * client-supplied `x-store-id` header, so we must verify it matches the
 * store baked into the authenticated user's JWT. Without this, any logged-in
 * user could read/write another store's data by swapping the header.
 *
 * This runs as a global guard, before the controller-scoped JwtAuthGuard, so
 * it decodes the bearer token itself (mirroring PermissionsGuard).
 */
@Injectable()
export class StoreIsolationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()

    // Resolve the authenticated identity from the bearer token. Unauthenticated
    // (public/storefront) requests have no token — leave them to other guards.
    const authHeader = request.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
      return true
    }

    let decoded: { storeId?: string | null; role?: string } | null = null
    try {
      const secret = this.configService.get('JWT_SECRET_KEY')
      decoded = jwt.verify(authHeader.substring(7), secret) as any
    } catch {
      // Invalid/expired token — authentication guards will reject it.
      return true
    }

    // Super admins legitimately operate across every store.
    if (decoded?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    const userStoreId = decoded?.storeId

    // Store context the request is trying to act on (set by StoreContextMiddleware).
    let headerStoreId = request.storeId || (request.headers['x-store-id'] as string) || null

    // If the request has no store context but the user is bound to a store,
    // implicitly scope the request to the user's store context.
    if (!headerStoreId && userStoreId) {
      headerStoreId = userStoreId
      request.storeId = userStoreId
    }

    // Token without a store (e.g. platform-level), or no store context to
    // validate against — nothing to compare here.
    if (!userStoreId || !headerStoreId) {
      return true
    }

    if (userStoreId !== headerStoreId) {
      throw new ForbiddenException({
        success: false,
        message: 'Store context mismatch: you are not allowed to access this store.',
      })
    }

    return true
  }
}
