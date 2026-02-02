import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as crypto from 'crypto'
import { MailService } from '../../../mail/mail.service'
import { CreateUserDto } from '../../user/dtos/create-user.dto'
import { UserDto } from '../../user/dtos/user.dto'
import { UserService } from '../../user/services/user.service'
import { LoginCredentialDto, RegisterCredentialDto } from '../dtos'

import { UserRole } from 'src/common/enums/user/user-role.enum'
import { TenantService } from '../../../tenant/tenant.service'

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name)
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerCredentialDto: RegisterCredentialDto, tenantId: string) {
    this.logger.log(`${this.register.name} Service Called`)

    const { username, email } = registerCredentialDto
    const findByUsername = await this.userService.findUserByUsername(username, tenantId)
    if (findByUsername) {
      throw new ConflictException('Username already exists for this tenant')
    }

    const findByEmail = await this.userService.findUserByEmail(email, tenantId)
    if (findByEmail) {
      throw new ConflictException('Email already exists for this tenant')
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = (await this.userService.createUser(
      { ...registerCredentialDto, emailVerificationToken: verificationToken, role: UserRole.User },
      tenantId,
    )) as CreateUserDto

    if (!user) {
      throw new InternalServerErrorException('Failed to create user')
    }

    // await this.mailService.sendVerificationEmail(user.email, verificationToken, tenantId)

    // console.log('Verification email sent to', user.email);

    const tokens = await this.getTokens(user)

    return { ...tokens, user }
  }

  async login(loginCredentialsDto: LoginCredentialDto, tenantId: string) {
    this.logger.log(`${this.login.name} Service Called`)

    // Check if tenant is suspended
    const tenant = await this.tenantService.findOne(tenantId)
    if (tenant && tenant.status === 'suspended') {
      throw new UnauthorizedException('Store is suspended. Please contact support.')
    }

    const { username, password } = loginCredentialsDto

    const user = await this.userService.findUserByUsername(username, tenantId)

    const valid = user ? await this.userService.validateUser(user, password) : false

    if (!valid) {
      throw new UnauthorizedException('Invalid Login Credentials')
    }

    const tokens = await this.getTokens(user)

    return {
      user,
      ...tokens,
    }
  }

  async getMe(user: UserDto) {
    this.logger.log(`${this.getMe.name} Service Called`)
    return user
  }

  async forgotPassword(email: string, tenantId: string) {
    this.logger.log(`${this.forgotPassword.name} Service Called`)
    const user = await this.userService.findUserByEmail(email, tenantId)
    if (!user) {
      // For security, don't reveal if user exists or not
      return
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    await this.userService.updateResetToken(user.id, resetToken, resetExpires)
    await this.mailService.sendResetPasswordEmail(user.email, resetToken, tenantId)
  }

  async resetPassword(token: string, newPassword: string) {
    this.logger.log(`${this.resetPassword.name} Service Called`)
    return this.userService.resetUserPasswordByToken(token, newPassword)
  }

  async verifyEmail(token: string) {
    return this.userService.verifyUserByToken(token)
  }

  async getTokens(user) {
    const payload = {
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
      sub: user.id,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES') || '15m',
      } as any),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES') || '7d',
      } as any),
    ])

    await this.userService.setCurrentRefreshToken(refreshToken, user.id)

    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.getUserIfRefreshTokenMatches(refreshToken, userId)
    if (!user) throw new UnauthorizedException('Access Denied')

    const tokens = await this.getTokens(user)
    return tokens
  }

  async logout(userId: string) {
    return this.userService.removeRefreshToken(userId)
  }
}
