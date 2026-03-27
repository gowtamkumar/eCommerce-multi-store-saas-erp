import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { JsonWebTokenError } from 'jsonwebtoken'
import { AuthStrategy } from '@/common/enums/auth/auth-strategy.enum'
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT_AUTH) {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }

  handleRequest(err, user, info) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(info.message || 'Invalid Token!')
    }
    if (err || info || !user) {
      throw err || new UnauthorizedException(`${info}`)
    }
    return user
  }
}
