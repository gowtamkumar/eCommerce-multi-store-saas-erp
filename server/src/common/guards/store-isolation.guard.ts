import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { UserRole } from '../enums/user/user-role.enum'

/**
 * Prevents cross-store access. The active store is taken from the
 * client-supplied `x-store-id` header, so we must verify it matches the
 * store baked into the authenticated user's JWT. Without this, any logged-in
 * user could read/write another store's data by swapping the header.
 */
@Injectable()
export class StoreIsolationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const { user } = request

    if (!user) {
      throw new ForbiddenException('User context is missing')
    }

    // Super admins legitimately operate across every store.
    if (user.role === UserRole.SUPER_ADMIN) {
      return true
    }

    const userStoreId = user.storeId

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
