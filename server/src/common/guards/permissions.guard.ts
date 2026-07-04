import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY, ANY_PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { SKIP_PERMISSION_CHECK_KEY } from '../decorators/skip-permission-check.decorator'
import { UserRole } from '../enums/user/user-role.enum'
import { PermissionResolutionService } from '../services/permission-resolution.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'

import { isCoreFeature, getPlanFeature } from '../constants/feature-mapping'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolutionService: PermissionResolutionService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const skipPermissionCheck = this.reflector.getAllAndOverride<boolean>(SKIP_PERMISSION_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (skipPermissionCheck) return true

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    const anyPermissions = this.reflector.getAllAndOverride<string[]>(ANY_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest()
    const { user } = request

    if (!user) {
      throw new ForbiddenException('User is not authenticated')
    }

    const userRole = (user.role || '').toLowerCase()
    const isGlobalAdmin = userRole === UserRole.SUPER_ADMIN

    const storeId = user.storeId || (request.headers['x-store-id'] as string)
    if (isGlobalAdmin && !storeId) return true

    const hasRequired =
      (requiredPermissions && requiredPermissions.length > 0) ||
      (anyPermissions && anyPermissions.length > 0)

    if (!hasRequired) {
      if (isGlobalAdmin) return true
      throw new ForbiddenException(
        'Access denied. This route requires explicit permission configuration.',
      )
    }

    if (!storeId) {
      if (isGlobalAdmin) return true
      throw new ForbiddenException('User is not associated with a store.')
    }

    const branchId = (request.headers['x-branch-id'] as string) || user.branchId || undefined
    const warehouseId = request.headers['x-warehouse-id'] as string | undefined
    const scope = { branchId, warehouseId }

    if (isGlobalAdmin) {
      // Super Admin bypasses RBAC roles, but MUST NOT bypass store subscription plan features!
      const checkPerm = (requiredPermissions && requiredPermissions[0]) || (anyPermissions && anyPermissions[0])
      if (checkPerm) {
        const { manifest } = await this.resolutionService.resolvePermissionsFromManifest(
          user.id,
          storeId,
          [checkPerm],
          scope,
        )
        const feat = checkPerm.split(':')[0]
        const planFeat = getPlanFeature(feat)
        if (!isCoreFeature(feat) && !isCoreFeature(planFeat)) {
          const isEnabled = manifest.featuresEnabled.includes(feat) || manifest.featuresEnabled.includes(planFeat)
          if (!isEnabled) {
            throw new ForbiddenException(`Feature "${feat}" is not included in this store's subscription plan.`)
          }
        }
      }
      return true
    }

    if (requiredPermissions?.length) {
      const { denied } = await this.resolutionService.resolvePermissionsFromManifest(
        user.id,
        storeId,
        requiredPermissions,
        scope,
      )

      if (denied !== null) {
        await this.auditLogService.logPermissionCheckFailed(
          storeId,
          user.id,
          denied,
          `Access denied to route: ${request.method} ${request.url}`,
        )
        throw new ForbiddenException(
          `Access Denied: You do not have the required permission (${denied}) to perform this action.`,
        )
      }
    }

    if (anyPermissions?.length) {
      let allowed = false
      for (const perm of anyPermissions) {
        const { denied } = await this.resolutionService.resolvePermissionsFromManifest(
          user.id,
          storeId,
          [perm],
          scope,
        )
        if (denied === null) {
          allowed = true
          break
        }
      }
      if (!allowed) {
        await this.auditLogService.logPermissionCheckFailed(
          storeId,
          user.id,
          anyPermissions[0],
          `Access denied to route: ${request.method} ${request.url}`,
        )
        throw new ForbiddenException(
          `Access Denied: You do not have any of the required permissions (${anyPermissions.join(', ')}) to perform this action.`,
        )
      }
    }

    return true
  }
}
