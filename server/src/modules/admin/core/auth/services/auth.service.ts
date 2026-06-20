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
import { InjectRepository } from '@nestjs/typeorm'
import * as crypto from 'crypto'
import { Not, Repository } from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { sanitizeUser } from '@/common/utils/sanitize-user.util'
import { LoginCredentialDto, RegisterCredentialDto } from '../dtos'
import { SessionEntity } from '../entities/session.entity'

import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { ReferralService } from '@/modules/admin/marketing/loyalty/services/referral.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

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
    private readonly permissionResolutionService: PermissionResolutionService,
    private readonly notificationService: NotificationService,
    private readonly referralService: ReferralService,
    private readonly cacheService: CacheService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async register(
    registerCredentialDto: RegisterCredentialDto,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
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

    // Generate unique referral code for the user
    try {
      const refCode = await this.referralService.generateUniqueReferralCode(user.name, tenantId)
      await this.userService.updateUser(user.id, { referralCode: refCode } as any)
      user.referralCode = refCode
    } catch (e: any) {
      this.logger.error(`Failed to generate referral code: ${e.message}`)
    }

    // Link referral if referrer code was supplied
    if (registerCredentialDto.referralCode) {
      try {
        await this.referralService.linkReferral(
          user.id,
          registerCredentialDto.referralCode,
          tenantId,
          undefined,
          'signup',
        )
      } catch (e: any) {
        this.logger.error(`Failed to link referral code: ${e.message}`)
      }
    }

    // await this.mailService.sendVerificationEmail(user.email, verificationToken, tenantId)

    const tokens = await this.getTokens(user, [], ipAddress, userAgent)

    return { ...tokens, user: sanitizeUser(user) as UserEntity }
  }

  async login(
    loginCredentialsDto: LoginCredentialDto,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
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

    const tokens = await this.getTokens(user, features, ipAddress, userAgent)

    let permissionManifest = null
    if (tenantId) {
      permissionManifest = await this.permissionResolutionService.resolvePermissionsManifest(
        user.id,
        tenantId,
      )
    }

    // Trigger New Device Login Alert (Simulation)
    try {
      if (tenantId) {
        await this.notificationService.createNotification(
          {
            title: 'Security Warning: New Login',
            message: `A new device logged into your account (${user.username}). If this wasn't you, please reset your password.`,
            type: 'WARNING',
            link: `/admin/profile`,
            userId: user.id, // specifically alert the user
          },
          tenantId,
        )
      }
    } catch (e: any) {
      this.logger.error(`Failed to trigger security notification: ${e.message}`)
    }

    return {
      user: { ...sanitizeUser(user), features } as any,
      permissionManifest,
      ...tokens,
    } as any
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
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`${this.getTokens.name} Service Called`)

    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days matching refresh token default

    // Save session in database
    await this.sessionRepository.save({
      id: sessionId,
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
    })

    const payload = {
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
      sub: user.id,
      features,
      sessionId,
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
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`${this.refreshTokens.name} Service Called`)

    // Verify the refresh token's signature AND expiry before trusting it. The
    // bcrypt match below only proves it equals the stored token; without this
    // an expired refresh JWT would still be accepted until it is rotated out.
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      })
    } catch {
      throw new UnauthorizedException('Access Denied')
    }

    const user = await this.userService.getUserIfRefreshTokenMatches(refreshToken, userId)
    if (!user) throw new UnauthorizedException('Access Denied')

    let features: string[] = []
    if (user.role === UserRole.SUPER_ADMIN) {
      features = ['*']
    } else if (user.tenantId) {
      const tenant = await this.tenantService.findOneTenants(user.tenantId)
      features = tenant?.subscriptionPlan?.features || []
    }

    // Invalidate old session from rotated token (DB + Redis cache)
    let oldSessionId: string | null = null
    try {
      const decoded = this.jwtService.decode(refreshToken) as any
      if (decoded && decoded.sessionId) {
        oldSessionId = decoded.sessionId
      }
    } catch (e: any) {
      this.logger.error(`Failed to decode refresh token: ${e.message}`)
    }

    if (oldSessionId) {
      await this.sessionRepository.update({ id: oldSessionId }, { isActive: false })
      await this.cacheService.delCache(`auth:session:${oldSessionId}`)
    }

    const tokens = await this.getTokens(user, features, ipAddress, userAgent)
    return tokens
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    this.logger.log(`${this.logout.name} Service Called`)
    if (sessionId) {
      await this.sessionRepository.update({ id: sessionId, userId }, { isActive: false })
      // Evict the specific session from Redis so the JwtAuthStrategy cache is consistent
      await this.cacheService.delCache(`auth:session:${sessionId}`)
    } else {
      // Full logout: find all active sessions first so we can evict each one from Redis
      const activeSessions = await this.sessionRepository.find({
        where: { userId, isActive: true },
        select: { id: true },
      })
      await this.sessionRepository.update({ userId, isActive: true }, { isActive: false })
      await Promise.all(
        activeSessions.map((s) => this.cacheService.delCache(`auth:session:${s.id}`)),
      )
    }
    return this.userService.removeRefreshToken(userId)
  }

  async getUserSessions(userId: string): Promise<SessionEntity[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.sessionRepository.update({ id: sessionId, userId }, { isActive: false })
    // Evict the revoked session from Redis
    await this.cacheService.delCache(`auth:session:${sessionId}`)
  }

  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    // Find sessions to revoke before deactivating them, so we can evict each from Redis
    const sessionsToRevoke = await this.sessionRepository.find({
      where: { userId, isActive: true },
      select: { id: true },
    })
    await this.sessionRepository.update({ userId, id: Not(currentSessionId) }, { isActive: false })
    await Promise.all(
      sessionsToRevoke
        .filter((s) => s.id !== currentSessionId)
        .map((s) => this.cacheService.delCache(`auth:session:${s.id}`)),
    )
  }

  async createImpersonateToken(userId: string): Promise<string> {
    const payload = { userId, purpose: 'impersonation' }
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: '5m',
    })
  }

  async verifyImpersonateToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    })
  }

  async getUserForImpersonation(userId: string): Promise<UserEntity | null> {
    return this.userService.getUser(userId)
  }
}
