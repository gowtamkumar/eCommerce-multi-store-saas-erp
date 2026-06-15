import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AccessTokenPayload } from 'src/modules/admin/core/auth/dtos'
import { UserDto } from 'src/modules/admin/core/user/dtos/user.dto'
import { UserService } from 'src/modules/admin/core/user/services/user.service'
import { SessionEntity } from 'src/modules/admin/core/auth/entities/session.entity'
import { sanitizeUser } from 'src/common/utils/sanitize-user.util'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // secretOrKey: 'myJwtSecretFromConfig',
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      ignoreExpiration: false,
    })
  }

  async validate(
    payload: AccessTokenPayload & { sessionId?: string },
  ): Promise<UserDto & { sessionId?: string }> {
    const { sub: userId, sessionId } = payload
    try {
      if (!sessionId) {
        throw new UnauthorizedException('Token is missing session identifier')
      }

      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, isActive: true },
      })

      if (!session || new Date() > new Date(session.expiresAt)) {
        console.error(`[JwtStrategy] Session not found, inactive, or expired: ${sessionId}`)
        throw new UnauthorizedException('Session is invalid or has expired')
      }

      const user = await this.userService.getUser(userId)
      if (!user) {
        console.error(`[JwtStrategy] User not found for ID: ${userId}`)
        throw new UnauthorizedException('Token not valid - User not found')
      }

      return { ...sanitizeUser(user), sessionId } as any
    } catch (error) {
      console.error(`[JwtStrategy] Error validating user:`, error)
      throw new UnauthorizedException('Token not valid - Validation error')
    }
  }
}
