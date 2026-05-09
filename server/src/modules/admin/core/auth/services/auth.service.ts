import { RequestContextDto } from '@/common/dto/request-context.dto'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { UserDto } from '@/modules/admin/core/user/dtos/user.dto'
import { StaffInvitationService } from '@/modules/admin/core/user/services/staff-invitation.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
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
import { UserEntity } from '../../user/entities/user.entity'
import { LoginCredentialDto, RegisterCredentialDto } from '../dtos'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService,
    private readonly staffInvitationService: StaffInvitationService,
  ) { }

  async register(
    registerCredentialDto: RegisterCredentialDto,
    tenantId: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
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

    const user = await this.userService.createUser(
      { ...registerCredentialDto, emailVerificationToken: verificationToken, role: UserRole.USER },
      { tenantId } as RequestContextDto,
    )

    if (!user) {
      throw new InternalServerErrorException('Failed to create user')
    }

    // await this.mailService.sendVerificationEmail(user.email, verificationToken, tenantId)

    const tokens = await this.getTokens(user)

    return { ...tokens, user }
  }

  async login(
    loginCredentialsDto: LoginCredentialDto,
    tenantId: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    this.logger.log(`${this.login.name} Service Called`)
    const { username, password } = loginCredentialsDto
    const user = await this.userService.findUserByUsername(username, tenantId)

    if (!user) {
      throw new UnauthorizedException('Invalid Login Credentials')
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked. Please contact support.')
    }

    // Check if tenant is suspended (skip for super admin)
    if (user.role !== UserRole.SUPER_ADMIN && tenantId) {
      const tenant = await this.tenantService.findOneTenants(tenantId)
      if (tenant) {
        if (tenant.status === TenantStatus.SUSPENDED) {
          throw new UnauthorizedException('Store is suspended. Please contact support.')
        }
      }
    }

    const valid = user ? await this.userService.validateUser(user, password) : false

    if (!valid) {
      throw new UnauthorizedException('Invalid Login Credentials')
    }

    let features: string[] = []
    if (user.role === UserRole.SUPER_ADMIN) {
      features = ['*'] // Super admin has access to everything
    } else if (tenantId) {
      const tenant = await this.tenantService.findOneTenants(tenantId)
      features = tenant?.subscriptionPlan?.features || []
    }

    const tokens = await this.getTokens(user, features)

    return {
      user: { ...user, features } as any,
      ...tokens,
    }
  }

  async getMe(user: UserDto): Promise<UserDto> {
    this.logger.log(`${this.getMe.name} Service Called`)
    return user
  }

  async forgotPassword(email: string, tenantId: string): Promise<void> {
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

  async resetPassword(token: string, newPassword: string): Promise<UserEntity> {
    this.logger.log(`${this.resetPassword.name} Service Called`)
    return this.userService.resetUserPasswordByToken(token, newPassword)
  }

  async verifyEmail(token: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyEmail.name} Service Called`)
    return this.userService.verifyUserByToken(token)
  }

  async acceptInvitation(dto: any): Promise<{ message: string; user: UserEntity }> {
    this.logger.log(`${this.acceptInvitation.name} Service Called`)
    return this.staffInvitationService.acceptInvitation(dto)
  }

  async getTokens(
    user: any,
    features: string[] = [],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`${this.getTokens.name} Service Called`)
    const payload = {
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
      sub: user.id,
      features,
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

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`${this.refreshTokens.name} Service Called`)
    const user = await this.userService.getUserIfRefreshTokenMatches(refreshToken, userId)
    if (!user) throw new UnauthorizedException('Access Denied')

    let features: string[] = []
    if (user.role === UserRole.SUPER_ADMIN) {
      features = ['*']
    } else if (user.tenantId) {
      const tenant = await this.tenantService.findOneTenants(user.tenantId)
      features = tenant?.subscriptionPlan?.features || []
    }

    const tokens = await this.getTokens(user, features)
    return tokens
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`${this.logout.name} Service Called`)
    return this.userService.removeRefreshToken(userId)
  }
}
