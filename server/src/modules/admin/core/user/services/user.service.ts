import { RiskLevel } from '@/common/enums/risk-level.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateUserDto, FilterUserDto, UpdatePasswordDto, UpdateUserDto } from '../dtos'
import { StaffInvitationEntity } from '../entities/staff-invitation.entity'
import { UserEntity } from '../entities/user.entity'
import { PermissionEntity } from '../entities/permission.entity'
import { UserRepository } from '../repositories/user.repository'
import { StaffInvitationService } from './staff-invitation.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OnApplicationBootstrap } from '@nestjs/common'

@Injectable()
export class UserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private readonly userRepo: UserRepository,
    private readonly cacheService: CacheService,
    private readonly invitationService: StaffInvitationService,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPermissions()
  }

  async seedPermissions(): Promise<void> {
    this.logger.log('Seeding system permissions...')
    const permissionsToSeed = [
      {
        code: 'users:read',
        name: 'View Users',
        description: 'Can view user accounts and team members',
        module: 'Access Control',
        feature: 'users',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'users:write',
        name: 'Manage Users',
        description: 'Can create, edit, or delete users',
        module: 'Access Control',
        feature: 'users',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'users:invite',
        name: 'Invite Staff',
        description: 'Can invite staff members',
        module: 'Access Control',
        feature: 'users',
        action: 'invite',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'pos:create-sale',
        name: 'Create POS Sale',
        description: 'Can run POS register sales',
        module: 'POS',
        feature: 'pos',
        action: 'create-sale',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'pos:manage-shifts',
        name: 'Manage POS Shifts',
        description: 'Can manage register shifts',
        module: 'POS',
        feature: 'pos',
        action: 'manage-shifts',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'finance:read-ledger',
        name: 'View Ledger',
        description: 'Can view books and ledgers',
        module: 'Finance',
        feature: 'finance',
        action: 'read-ledger',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'finance:write-expense',
        name: 'Write Expense',
        description: 'Can record new expenses',
        module: 'Finance',
        feature: 'finance',
        action: 'write-expense',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'hrm:clock-attendance',
        name: 'Clock Attendance',
        description: 'Can clock in/out for shift attendance',
        module: 'HRM',
        feature: 'hrm',
        action: 'clock-attendance',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'hrm:process-payroll',
        name: 'Process Payroll',
        description: 'Can run payroll cycles',
        module: 'HRM',
        feature: 'hrm',
        action: 'process-payroll',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'hrm:manage-employees',
        name: 'Manage Employees',
        description: 'Can manage legal employee records',
        module: 'HRM',
        feature: 'hrm',
        action: 'manage-employees',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'orders:read',
        name: 'View Orders',
        description: 'Can view all customer orders',
        module: 'Orders',
        feature: 'orders',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'orders:write',
        name: 'Manage Orders',
        description: 'Can create and update orders',
        module: 'Orders',
        feature: 'orders',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'returns:read',
        name: 'View Returns',
        description: 'Can view return and refund requests',
        module: 'Orders',
        feature: 'returns',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'returns:write',
        name: 'Manage Returns',
        description: 'Can approve, reject, or update returns',
        module: 'Orders',
        feature: 'returns',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'payments:read',
        name: 'View Payments',
        description: 'Can view payment transactions and history',
        module: 'Finance',
        feature: 'payments',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'coupons:manage',
        name: 'Manage Coupons',
        description: 'Can create, edit, and delete discount coupons',
        module: 'Marketing',
        feature: 'coupons',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'promotions:manage',
        name: 'Manage Promotions',
        description: 'Can create and manage promotions',
        module: 'Marketing',
        feature: 'promotions',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'catalog:read',
        name: 'View Catalog',
        description: 'Can view products, categories, brands',
        module: 'Catalog',
        feature: 'catalog',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'catalog:write',
        name: 'Manage Catalog',
        description: 'Can create and edit products and categories',
        module: 'Catalog',
        feature: 'catalog',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'catalog:featured',
        name: 'Manage Featured Items',
        description: 'Can manage featured products, promotional items, and storefront sliders',
        module: 'Catalog',
        feature: 'catalog',
        action: 'featured',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'marketing:manage',
        name: 'Manage Marketing',
        description: 'Can manage campaigns and subscribers',
        module: 'Marketing',
        feature: 'marketing',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'crm:read',
        name: 'View Customers',
        description: 'Can view customer and lead info',
        module: 'CRM',
        feature: 'crm',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'crm:write',
        name: 'Manage Customers',
        description: 'Can edit customer and lead info',
        module: 'CRM',
        feature: 'crm',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'purchasing:read',
        name: 'View Purchasing',
        description: 'Can view purchase orders',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'purchasing:write',
        name: 'Manage Purchasing',
        description: 'Can create and edit purchase orders',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'inventory:read',
        name: 'View Inventory',
        description: 'Can view inventory ledgers and stock',
        module: 'Inventory',
        feature: 'inventory',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'inventory:write',
        name: 'Manage Inventory',
        description: 'Can manage stock and GRN',
        module: 'Inventory',
        feature: 'inventory',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'supplier:manage',
        name: 'Manage Suppliers',
        description: 'Can manage suppliers',
        module: 'Purchasing',
        feature: 'supplier',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'accounting:read',
        name: 'View Accounting',
        description: 'Can view accounting reports',
        module: 'Accounting',
        feature: 'accounting',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'accounting:write',
        name: 'Manage Accounting',
        description: 'Can manage chart of accounts',
        module: 'Accounting',
        feature: 'accounting',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'invoices:manage',
        name: 'Manage Invoices',
        description: 'Can manage invoices',
        module: 'Accounting',
        feature: 'invoices',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'reports:read',
        name: 'View Reports',
        description: 'Can view analytical reports',
        module: 'Reports',
        feature: 'reports',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'logistics:manage',
        name: 'Manage Logistics',
        description: 'Can manage logistics integrations',
        module: 'Logistics',
        feature: 'logistics',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'fulfillment:manage',
        name: 'Manage Fulfillment',
        description: 'Can manage order fulfillment',
        module: 'Logistics',
        feature: 'fulfillment',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'settings:manage',
        name: 'Manage Settings',
        description: 'Can manage system settings',
        module: 'Settings',
        feature: 'settings',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'content:manage',
        name: 'Manage Content',
        description: 'Can manage pages and FAQs',
        module: 'Content',
        feature: 'content',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
    ]

    for (const p of permissionsToSeed) {
      const existing = await this.permissionRepo.findOne({ where: { code: p.code } })
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(p))
      }
    }
    this.logger.log('Permissions seeded successfully.')
  }

  async getUsers(
    filterUserDto: FilterUserDto,
    ctx: RequestContextDto,
  ): Promise<{ users: UserEntity[]; total: number }> {
    this.logger.log(`${this.getUsers.name} Service Called`)
    const tenantId = ctx.tenantId
    const [users, total] = await this.userRepo.findAllWithFilters(filterUserDto, tenantId)
    return { users, total }
  }

  async findAllUsersCrossTenant(filterDto: FilterUserDto): Promise<[UserEntity[], number]> {
    this.logger.log(`${this.findAllUsersCrossTenant.name} Service Called`)
    return this.userRepo.findAllCrossTenant(filterDto)
  }

  async getUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.getUser.name} Service Called`)
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundException(`User of id ${id} not found`)
    return user
  }

  async findOneUser(id: string, ctx: RequestContextDto): Promise<UserEntity> {
    this.logger.log(`${this.findOneUser.name} Service Called`)
    const tenantId = ctx.tenantId
    const user = await this.userRepo.findByIdAndTenant(id, tenantId)
    if (!user) throw new NotFoundException(`User with id ${id} not found in this tenant.`)
    return user
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    this.logger.log(`${this.findUserById.name} Service Called for ID: ${id}`)
    const cacheKey = `user:profile:${id}`

    // Attempt to fetch from cache with logging
    const cachedUser = await this.cacheService.getCache<UserEntity>(cacheKey)
    if (cachedUser) {
      this.logger.verbose(`Cache HIT for ${cacheKey}`)
      return cachedUser
    }

    this.logger.verbose(`Cache MISS for ${cacheKey}. Fetching from DB...`)
    const user = await this.userRepo.findById(id)

    if (user) {
      await this.cacheService.setCache(cacheKey, user, 3600)
    }

    return user
  }

  async findUserByUsername(username: string, tenantId?: string): Promise<UserEntity | null> {
    this.logger.log(`${this.findUserByUsername.name} Service Called`)
    return this.userRepo.findByUsername(username, tenantId)
  }

  async findUserByEmail(email: string, tenantId?: string): Promise<UserEntity | null> {
    this.logger.log(`${this.findUserByEmail.name} Service Called`)
    return this.userRepo.findByEmail(email, tenantId)
  }

  async createUser(createUserDto: CreateUserDto, ctx: RequestContextDto): Promise<UserEntity> {
    this.logger.log(`${this.createUser.name} Service Called`)
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = await this.userRepo.createAndSave(
      {
        ...createUserDto,
        password: hashPassword,
      } as any,
      ctx,
    )
    return user
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`${this.updateUser.name} Service Called for ID: ${id}`)
    const user = await this.getUser(id)
    const result = await this.userRepo.updateAndSave(user, updateUserDto)

    const cacheKey = `user:profile:${id}`
    await this.cacheService.delCache(cacheKey)
    this.logger.verbose(`Cache INVALIDATED for ${cacheKey} due to profile update`)

    return result
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<UserEntity> {
    this.logger.log(`${this.updatePassword.name} Service Called`)
    const { currentPassword, newPassword } = updatePasswordDto
    const user = await this.getUser(id)

    const valid = await this.validateUser(user, currentPassword)
    if (!valid) throw new UnauthorizedException('Password is not valid')

    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    const result = await this.userRepo.updateAndSave(user, { password: newHashedPassword } as any)
    await this.cacheService.delCache(`user:profile:${id}`)
    return result
  }

  async resetPassword(id: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetPassword.name} Service Called`)
    const user = await this.getUser(id)
    const newHashedPassword = await bcrypt.hash(password, 10)
    return this.userRepo.updateAndSave(user, { password: newHashedPassword } as any)
  }

  async deleteUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.deleteUser.name} Service Called`)
    const user = await this.getUser(id)
    const result = await this.userRepo.deleteUser(user)
    if (user.tenantId) {
      await this.cacheService.delCache('team:members', user.tenantId)
    }
    return result
  }

  validateUser(user: UserEntity, password: string): Promise<boolean> {
    this.logger.log(`${this.validateUser.name} Service Called`)
    return bcrypt.compare(password, user.password)
  }

  async verifyUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyUser.name} Service Called`)
    const user = await this.getUser(id)
    return this.userRepo.updateAndSave(user, { isEmailVerified: true })
  }

  async verifyUserByToken(token: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyUserByToken.name} Service Called`)
    const user = await this.userRepo.findByVerificationToken(token)
    if (!user) throw new NotFoundException('Invalid or expired verification token')
    return this.userRepo.updateAndSave(user, {
      isEmailVerified: true,
      emailVerificationToken: null,
    } as any)
  }

  async updateResetToken(userId: string, token: string, expires: Date): Promise<UserEntity> {
    this.logger.log(`${this.updateResetToken.name} Service Called`)
    const user = await this.getUser(userId)
    return this.userRepo.updateAndSave(user, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    } as any)
  }

  async resetUserPasswordByToken(token: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetUserPasswordByToken.name} Service Called`)
    const user = await this.userRepo.findByResetToken(token)

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new NotFoundException('Invalid or expired reset token')
    }

    const newHashedPassword = await bcrypt.hash(password, 10)
    return this.userRepo.updateAndSave(user, {
      password: newHashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    } as any)
  }

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.userRepo.countByTenant(tenantId)
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string): Promise<void> {
    this.logger.log(`${this.setCurrentRefreshToken.name} Service Called`)
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userRepo.updateRefreshToken(userId, currentRefreshToken)
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: string,
  ): Promise<UserEntity | null> {
    this.logger.log(`${this.getUserIfRefreshTokenMatches.name} Service Called`)
    const user = await this.userRepo.findUserWithRefreshToken(userId)

    if (!user || !user.refreshToken) return null

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken)
    if (isRefreshTokenMatching) return user
    return null
  }

  async removeRefreshToken(userId: string): Promise<void> {
    this.logger.log(`${this.removeRefreshToken.name} Service Called`)
    await this.userRepo.updateRefreshToken(userId, null)
  }

  async userOverview(): Promise<any> {
    this.logger.log(`${this.userOverview.name} Service Called`)
    return this.userRepo.getOverviewStats()
  }

  // Staff invitation methods are now handled by StaffInvitationService

  async getTeamMembers(
    ctx: RequestContextDto,
  ): Promise<{ members: UserEntity[]; pendingInvitations: StaffInvitationEntity[] }> {
    this.logger.log(`${this.getTeamMembers.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = 'team:members'

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [members, pendingInvitations] = await Promise.all([
          this.userRepo.findTeamMembers(tenantId),
          this.invitationService.findPendingByTenant(ctx),
        ])
        return { members, pendingInvitations }
      },
      600, // 10 min cache
      tenantId,
    )
  }

  async updateTeamMemberRole(
    memberId: string,
    role: UserRole,
    ctx: RequestContextDto,
  ): Promise<UserEntity> {
    this.logger.log(`${this.updateTeamMemberRole.name} Service Called`)
    const tenantId = ctx.tenantId
    const user = await this.userRepo.findByIdAndTenant(memberId, tenantId)
    if (!user) throw new NotFoundException('Team member not found.')
    const result = await this.userRepo.updateAndSave(user, { role })
    await this.cacheService.delCache('team:members', tenantId)
    return result
  }
}
