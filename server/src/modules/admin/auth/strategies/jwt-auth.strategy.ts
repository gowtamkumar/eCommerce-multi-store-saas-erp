import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { UserService } from '../../user/services/user.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserDto } from '../../user/dtos/user.dto'
import { AccessTokenPayload } from '../dtos'
import { ConfigService } from '@nestjs/config'

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
    console.log("[JwtStrategy] Validate called with payload:", JSON.stringify(payload));
    const { sub: userId } = payload
    try {
      const user = await this.userService.getUser(userId)
      if (!user) {
        console.error(`[JwtStrategy] User not found for ID: ${userId}`);
        throw new UnauthorizedException('Token not valid - User not found')
      }
      return user
    } catch (error) {
      console.error(`[JwtStrategy] Error validating user:`, error);
      throw new UnauthorizedException('Token not valid - Validation error');
    }

  }
}
