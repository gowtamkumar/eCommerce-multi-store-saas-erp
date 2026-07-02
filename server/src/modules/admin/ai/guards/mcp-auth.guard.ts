import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = (request.query.token as string) || (request.headers.authorization?.replace('Bearer ', '') as string)

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

      // Attach user and store context to request for subsequent RequestContext decorator lookup
      request.user = { ...user, sessionId: decoded.sessionId || null }
      request.storeId = user.storeId || null

      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
