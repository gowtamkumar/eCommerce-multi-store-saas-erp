import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JsonWebTokenError } from 'jsonwebtoken'
import { AuthStrategy } from '../enums/auth/auth-strategy.enum'

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JwtAuth) {
  anActivate(context: ExecutionContext) {
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
