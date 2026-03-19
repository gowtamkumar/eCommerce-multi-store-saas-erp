import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AccessTokenPayload } from 'src/modules/admin/core/auth/dtos'
import { UserDto } from 'src/modules/admin/core/user/dtos/user.dto'
import { UserService } from 'src/modules/admin/core/user/services/user.service'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // secretOrKey: 'myJwtSecretFromConfig',
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      ignoreExpiration: false,
    })
  }

  async validate(payload: AccessTokenPayload): Promise<UserDto> {
    const { sub: userId } = payload
    try {
      const user = await this.userService.getUser(userId)
      if (!user) {
        console.error(`[JwtStrategy] User not found for ID: ${userId}`)
        throw new UnauthorizedException('Token not valid - User not found')
      }
      return user
    } catch (error) {
      console.error(`[JwtStrategy] Error validating user:`, error)
      throw new UnauthorizedException('Token not valid - Validation error')
    }
  }
}
