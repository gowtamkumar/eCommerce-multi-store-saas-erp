import { UserService } from '@/modules/admin/core/user/services/user.service'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import * as jwt from 'jsonwebtoken'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { UserRole } from '../enums/user/user-role.enum'
import { PermissionResolutionService } from '../services/permission-resolution.service'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly resolutionService: PermissionResolutionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 0. Bypass permission check for @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true // No permissions are required for this endpoint
    }

    const request = context.switchToHttp().getRequest()
    let { user } = request

    if (!user) {
      const authHeader = request.headers['authorization']
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const secret = this.configService.get('JWT_SECRET_KEY')
          const decoded = jwt.verify(token, secret) as any
          if (decoded && decoded.sub) {
            user = await this.userService.getUser(decoded.sub)
            request.user = user
          }
        } catch (error) {
          // Ignore token parsing error, let it fall through
        }
      }
    }

    if (!user) {
      return false // Require auth first
    }

    const userRole = user.role || ''
    const isGlobalAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(userRole.toLowerCase())

    // 1. Super Admins and Admins bypass all dynamic permissions checks
    // Step 0: The global bypass (for backward compat)
    if (isGlobalAdmin) {
      return true
    }

    const tenantId = user.tenantId
    if (!tenantId) {
      throw new ForbiddenException('User is not associated with a tenant.')
    }

    // Extract potential scope from request headers
    const scopeId = request.headers['x-scope-id'] || undefined

    // 2. Use the 5-step PermissionResolutionService for each required permission
    for (const perm of requiredPermissions) {
      const allowed = await this.resolutionService.resolvePermission(
        user.id,
        tenantId,
        perm,
        scopeId,
      )
      if (!allowed) {
        throw new ForbiddenException(
          `Access Denied: You do not possess the required permission (${perm}) to execute this operation.`,
        )
      }
    }

    return true
  }
}
