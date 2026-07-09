import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token =
      (request.query.token as string) ||
      (request.headers.authorization?.replace('Bearer ', '') as string)

    if (!token) {
      throw new UnauthorizedException('Authentication token is required')
    }

    const secret = this.configService.get<string>('JWT_SECRET_KEY')
    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET_KEY is not configured')
    }

    try {
      const decoded = jwt.verify(token, secret) as { sub: string; sessionId?: string }
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token payload')
      }

      const user = await this.userService.findUserById(decoded.sub)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      // Check permissions: super admins and system admins always have access
      const isSuperAdmin = user.isAdmin || user.role === UserRole.SUPER_ADMIN
      if (!isSuperAdmin && user.roleId) {
        const role = await this.roleRepository.findOne({
          where: { id: user.roleId },
          relations: { permissions: true },
        })
        if (!role || !role.permissions?.some((p) => p.code === SystemPermissions.AI_USE)) {
          throw new ForbiddenException(
            'You do not have the required AI permission to use MCP tools.',
          )
        }
      } else if (!isSuperAdmin && !user.roleId) {
        throw new ForbiddenException('User has no role assigned.')
      }

      // Attach user and store context to request for subsequent RequestContext decorator lookup
      request.user = { ...user, sessionId: decoded.sessionId || null }
      request.storeId = user.storeId || null

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
