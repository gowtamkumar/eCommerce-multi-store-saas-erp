import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PlatformSettingsService } from '@/modules/system/platform/platform-settings.service'
import { UserRole } from '../enums/user/user-role.enum'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly settingsService: PlatformSettingsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const path = request.url || ''

    // 1. Bypass check for vital system/auth/onboarding routes needed to resolve settings, login, or domains
    const isSystemOrAuthRoute = 
      path.includes('/platform/settings') || 
      path.includes('/auth/') || 
      path.includes('/login') || 
      path.includes('/tenants') || 
      path.includes('/settings/public') || 
      path.includes('/super-admin/impersonate');

    if (isSystemOrAuthRoute) {
      return true
    }

    // 2. Bypass check for routes explicitly marked public via decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    // 3. Resolve user identity from request context or extract and decode raw JWT Bearer token
    let user = request.user
    if (!user) {
      const authHeader = request.headers['authorization']
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const payloadBase64 = token.split('.')[1]
          if (payloadBase64) {
            const payloadJson = Buffer.from(payloadBase64, 'base64').toString('ascii')
            const payload = JSON.parse(payloadJson)
            if (payload) {
              user = { role: payload.role }
            }
          }
        } catch (err) {
          // Ignore parsing errors
        }
      }
    }

    // 4. Super Admins bypass maintenance mode to allow troubleshooting/system updates
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    // 5. Check database settings
    try {
      const settings = await this.settingsService.getPlatformSettings()
      if (settings?.isMaintenanceMode) {
        throw new ServiceUnavailableException({
          success: false,
          statusCode: 503,
          message: settings.maintenanceMessage || 'Platform is currently undergoing scheduled upgrades. Please try again shortly.',
          error: 'Service Unavailable',
        })
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableException) {
        throw err
      }
      // If service fails or DB is offline, continue and let standard DB exceptions bubble up
    }

    return true
  }
}
