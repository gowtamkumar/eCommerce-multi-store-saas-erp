import { RequestContextDto } from '@/common/dto/request-context.dto'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { UserDto } from '@/modules/admin/core/user/dtos/user.dto'
import { StaffInvitationService } from '@/modules/admin/core/user/services/staff-invitation.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { StoreService } from '@/modules/system/store/store.service'
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
import * as bcrypt from 'bcrypt'
import { Not, Repository } from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { sanitizeUser } from '@/common/utils/sanitize-user.util'
import { LoginCredentialDto, RegisterCredentialDto } from '../dtos'
import { SessionEntity } from '../entities/session.entity'

import {
  PermissionManifest,
  PermissionResolutionService,
} from '@/common/services/permission-resolution.service'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'
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
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
    private readonly staffInvitationService: StaffInvitationService,
    private readonly permissionResolutionService: PermissionResolutionService,
    private readonly roleManagementService: RoleManagementService,
    private readonly notificationService: NotificationService,
    private readonly referralService: ReferralService,
    private readonly cacheService: CacheService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) { }

  async register(
    registerCredentialDto: RegisterCredentialDto,
    storeId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    this.logger.log(`${this.register.name} Service Called`)

    const { username, email } = registerCredentialDto
    const findByUsername = await this.userService.findUserByUsername(username, storeId)
    if (findByUsername) {
      throw new ConflictException('Username already exists for this store')
    }

    const findByEmail = await this.userService.findUserByEmail(email, storeId)
    if (findByEmail) {
      throw new ConflictException('Email already exists for this store')
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await this.userService.createUser(
      { ...registerCredentialDto, emailVerificationToken: verificationToken, role: UserRole.USER },
      { storeId } as RequestContextDto,
    )

    if (!user) {
      throw new InternalServerErrorException('Failed to create user')
    }

    // Generate unique referral code for the user
    try {
      const refCode = await this.referralService.generateUniqueReferralCode(user.name, storeId)
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
          storeId,
          undefined,
          'signup',
        )
      } catch (e: any) {
        this.logger.error(`Failed to link referral code: ${e.message}`)
      }
    }

    // await this.mailService.sendVerificationEmail(user.email, verificationToken, storeId)

    const tokens = await this.getTokens(user, [], ipAddress, userAgent)

    return { ...tokens, user: sanitizeUser(user) as UserEntity }
  }

  async login(
    loginCredentialsDto: LoginCredentialDto,
    storeId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const { usernameOrEmail, password } = loginCredentialsDto
    let user = await this.userService.findUserByUsername(usernameOrEmail, storeId)
    if (!user) {
      user = await this.userService.findUserByEmail(usernameOrEmail, storeId)
    }

    if (!user) {
      // Fallback for global Super Admin login from store subdomains or domains
      const globalUser = await this.userService.findUserByUsername(usernameOrEmail) ||
        await this.userService.findUserByEmail(usernameOrEmail)
      if (globalUser && globalUser.role === UserRole.SUPER_ADMIN) {
        user = globalUser
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid Login Credentials')
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked. Please contact support.')
    }

    // Check if store is suspended (skip for super admin)
    if (user.role !== UserRole.SUPER_ADMIN && storeId) {
      const store = await this.storeService.findOneStores(storeId)
      if (store) {
        if (store.status === StoreStatus.SUSPENDED) {
          throw new UnauthorizedException('Store is suspended. Please contact support.')
        }
      }
    }

    const valid = user ? await this.userService.validateUser(user, password) : false

    if (!valid) {
      throw new UnauthorizedException('Invalid Login Credentials')
    }

    let features: string[] = []
    let permissionManifest = null

    if (user.role === UserRole.SUPER_ADMIN) {
      features = ['*']
    } else if (storeId) {
      const ctx = await this.resolveStaffPermissionContext(user, storeId)
      permissionManifest = ctx.permissionManifest
      features = ctx.features
    }

    const tokens = await this.getTokens(user, features, ipAddress, userAgent)

    // Trigger New Device Login Alert (Simulation)
    try {
      if (storeId) {
        await this.notificationService.createNotification(
          {
            title: 'Security Warning: New Login',
            message: `A new device logged into your account (${user.username}). If this wasn't you, please reset your password.`,
            type: 'WARNING',
            link: `/admin/profile`,
            userId: user.id, // specifically alert the user
          },
          storeId,
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

  async getMe(user: UserDto): Promise<any> {
    this.logger.log(`${this.getMe.name} Service Called`)
    const liveUser = await this.userService.findUserById(user.id)
    if (!liveUser || liveUser.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User not found or blocked')
    }

    let permissionManifest = null
    let features: string[] = []

    if (liveUser.role === UserRole.SUPER_ADMIN) {
      features = ['*']
    } else if (liveUser.storeId) {
      const ctx = await this.resolveStaffPermissionContext(liveUser, liveUser.storeId)
      permissionManifest = ctx.permissionManifest
      features = ctx.features
    }

    return {
      user: { ...sanitizeUser(liveUser), features } as any,
      permissionManifest,
    }
  }

  private async resolveStaffPermissionContext(
    user: Pick<UserEntity, 'id' | 'role' | 'branchId' | 'warehouseId'>,
    storeId: string,
  ): Promise<{ permissionManifest: { featuresEnabled: string[]; permissions: string[] }; features: string[] }> {
    await this.roleManagementService.ensureLegacyRoleAssignment(user.id, storeId, user.role, {
      branchId: user.branchId,
      warehouseId: user.warehouseId,
    })
    const permissionManifest = await this.permissionResolutionService.resolvePermissionsManifest(
      user.id,
      storeId,
    )
    const features =
      permissionManifest.featuresEnabled.length > 0
        ? permissionManifest.featuresEnabled
        : (await this.storeService.findOneStores(storeId))?.subscriptionPlan?.features || []

    this.logger.debug(
      `Resolved manifest for user ${user.id}: ${permissionManifest.permissions.length} permissions, ${features.length} features`,
    )

    return { permissionManifest, features }
  }

  async forgotPassword(email: string, storeId: string): Promise<void> {
    this.logger.log(`${this.forgotPassword.name} Service Called`)
    const user = await this.userService.findUserByEmail(email, storeId)
    if (!user) {
      // For security, don't reveal if user exists or not
      return
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    await this.userService.updateResetToken(user.id, resetToken, resetExpires)
    await this.mailService.sendResetPasswordEmail(user.email, resetToken, storeId)
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

    const payload = {
      username: user.username,
      storeId: user.storeId,
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
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY') || this.configService.get<string>('JWT_SECRET_KEY'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES') || '7d',
      } as any),
    ])

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    // Save session in database
    await this.sessionRepository.save({
      id: sessionId,
      userId: user.id,
      storeId: user.storeId,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
      hashedRefreshToken,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshTokens(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string
    refreshToken: string
    permissionManifest: PermissionManifest | null
  }> {
    this.logger.log(`${this.refreshTokens.name} Service Called`)

    // Verify the refresh token's signature AND expiry before trusting it.
    let payload: any
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY') || this.configService.get<string>('JWT_SECRET_KEY'),
      })
    } catch {
      throw new UnauthorizedException('Access Denied')
    }

    const userId = payload?.sub
    const sessionId = payload?.sessionId
    if (!userId || !sessionId) {
      throw new UnauthorizedException('Access Denied')
    }

    const session = await this.sessionRepository.findOne({ where: { id: sessionId, userId } })
    if (!session || !session.isActive || new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Access Denied')
    }

    if (!session.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied')
    }

    const isMatch = await bcrypt.compare(refreshToken, session.hashedRefreshToken)
    if (!isMatch) {
      // Refresh token reuse detected! Revoke all sessions for this user for security.
      await this.sessionRepository.update({ userId }, { isActive: false })
      throw new UnauthorizedException('Access Denied')
    }

    const user = await this.userService.getUser(userId)
    if (!user || user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Access Denied')
    }

    let features: string[] = []
    let permissionManifest = null

    if (user.role === UserRole.SUPER_ADMIN) {
      features = ['*']
    } else if (user.storeId) {
      const ctx = await this.resolveStaffPermissionContext(user, user.storeId)
      permissionManifest = ctx.permissionManifest
      features = ctx.features
    }

    // Invalidate old session (DB + cache)
    await this.sessionRepository.update({ id: sessionId }, { isActive: false })
    await this.cacheService.delCache(`auth:session:${sessionId}`)

    const tokens = await this.getTokens(user, features, ipAddress, userAgent)
    return { ...tokens, permissionManifest }
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
