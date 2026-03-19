import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { Repository } from 'typeorm'
import { CreateUserDto, FilterUserDto, UpdatePasswordDto, UpdateUserDto } from '../dtos'
import { InviteStaffDto, AcceptInvitationDto } from '../dtos/invite-staff.dto'
import { UserEntity } from '../entities/user.entity'
import { StaffInvitationEntity, InvitationStatus } from '../entities/staff-invitation.entity'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(StaffInvitationEntity)
    private readonly invitationRepo: Repository<StaffInvitationEntity>,
    private readonly mailService: MailService,
  ) { }

  async getUsers(
    filterUserDto: FilterUserDto,
    tenantId: string,
  ): Promise<{ users: UserEntity[]; total: number }> {
    this.logger.log(`${this.getUsers.name} Service Called`)
    const { name, username, status, page, limit, q } = filterUserDto
    const query = this.userRepo
      .createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` })
    }
    if (username) {
      query.andWhere('user.username = :username', { username })
    }
    if (status) {
      query.andWhere('user.status = :status', { status })
    }
    if (q) {
      query.andWhere('(user.name ILIKE :q OR user.email ILIKE :q)', { q: `%${q}%` })
    }

    const [users, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { users, total, }
  }

  async findAllUsersCrossTenant(): Promise<UserEntity[]> {
    this.logger.log(`${this.findAllUsersCrossTenant.name} Service Called`)
    return this.userRepo.find({
      relations: ['tenant'],
    })
  }

  async getUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.getUser.name} Service Called`)

    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`)
    }
    return user
  }

  async findUserById(id: string) {
    this.logger.log(`${this.findUserById.name} Service Called`)
    return this.userRepo.findOne({ where: { id } })
  }

  async findUserByUsername(username: string, tenantId?: string) {
    this.logger.log(`${this.findUserByUsername.name} Service Called`)
    const where: { username: string; tenantId?: string } = { username }
    if (tenantId) where.tenantId = tenantId
    return this.userRepo.findOne({ where })
  }

  async findUserByEmail(email: string, tenantId?: string) {
    this.logger.log(`${this.findUserByEmail.name} Service Called`)
    const where: { email: string; tenantId?: string } = { email }
    if (tenantId) where.tenantId = tenantId
    return this.userRepo.findOne({ where })
  }

  async createUser(createUserDto: CreateUserDto, tenantId?: string): Promise<UserEntity> {
    this.logger.log(`${this.createUser.name} Service Called`)

    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashPassword,
      tenantId,
    } as CreateUserDto)
    await this.userRepo.save(user)
    delete (user as CreateUserDto).password
    return user
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`${this.updateUser.name} Service Called`)

    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`)
    }
    this.userRepo.merge(user, updateUserDto)
    return this.userRepo.save(user)
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<UserEntity> {
    this.logger.log(`${this.updatePassword.name} Service Called`)

    const { currentPassword, newPassword } = updatePasswordDto

    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`)
    }
    const valid = await this.validateUser(user, currentPassword)
    if (!valid) {
      throw new UnauthorizedException('Password is not valid')
    }

    user.password = await bcrypt.hash(newPassword, 10)
    return this.userRepo.save(user)
  }

  async resetPassword(id: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetPassword.name} Service Called`)
    const user = await this.getUser(id)
    user.password = await bcrypt.hash(password, 10)
    return this.userRepo.save(user)
  }

  async deleteUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.deleteUser.name} Service Called`)

    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`)
    }
    return this.userRepo.remove(user)
  }

  validateUser(user: UserEntity, password: string): Promise<boolean> {
    this.logger.log(`${this.validateUser.name} Service Called`);
    return bcrypt.compare(password, user.password)
  }

  async verifyUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyUser.name} Service Called`);
    const user = await this.getUser(id)
    user.isEmailVerified = true
    return this.userRepo.save(user)
  }

  async verifyUserByToken(token: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyUserByToken.name} Service Called`);
    const user = await this.userRepo.findOne({ where: { emailVerificationToken: token } })
    if (!user) {
      throw new NotFoundException('Invalid or expired verification token')
    }
    user.isEmailVerified = true
    user.emailVerificationToken = null
    return this.userRepo.save(user)
  }

  async updateResetToken(userId: string, token: string, expires: Date) {
    this.logger.log(`${this.updateResetToken.name} Service Called`);
    const user = await this.getUser(userId)
    user.resetPasswordToken = token
    user.resetPasswordExpires = expires
    return this.userRepo.save(user)
  }

  async resetUserPasswordByToken(token: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetUserPasswordByToken.name} Service Called`);
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: token },
    })

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new NotFoundException('Invalid or expired reset token')
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    return this.userRepo.save(user)
  }

  async countByTenant(tenantId: string) {
    this.logger.log(`${this.countByTenant.name} Service Called`);
    return await this.userRepo.count({ where: { tenantId } })
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    this.logger.log(`${this.setCurrentRefreshToken.name} Service Called`);
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userRepo.update(userId, {
      refreshToken: currentRefreshToken,
    })
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    this.logger.log(`${this.getUserIfRefreshTokenMatches.name} Service Called`);
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :userId', { userId })
      .getOne()

    if (!user || !user.refreshToken) {
      return null
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken)

    if (isRefreshTokenMatching) {
      return user
    }
  }

  async removeRefreshToken(userId: string) {
    this.logger.log(`${this.removeRefreshToken.name} Service Called`);
    return this.userRepo.update(userId, {
      refreshToken: null,
    })
  }

  async userOverview() {
    this.logger.log(`${this.userOverview.name} Service Called`);
    const totalUsers = await this.userRepo.count()
    const activeUsers = await this.userRepo.count({
      where: { status: UserStatus.Active },
    })
    const inactiveUsers = await this.userRepo.count({
      where: { status: UserStatus.Inactive },
    })
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
    }
  }

  // ─── Team / Staff Invitation Methods ───────────────────────────────────────

  async inviteStaff(dto: InviteStaffDto, tenantId: string, invitedBy: string) {
    this.logger.log(`${this.inviteStaff.name} Service Called`);

    // Prevent re-inviting an existing active user
    const existingUser = await this.findUserByEmail(dto.email, tenantId)
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists in your team.')
    }

    // Expire any old pending invitation for same email+tenant
    await this.invitationRepo.update(
      { email: dto.email, tenantId, status: InvitationStatus.Pending },
      { status: InvitationStatus.Expired },
    )

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    const invitation = this.invitationRepo.create({
      email: dto.email,
      role: dto.role,
      tenantId,
      token,
      expiresAt,
      invitedBy,
      status: InvitationStatus.Pending,
    })

    await this.invitationRepo.save(invitation)

    // Send email (non-blocking – errors are logged internally)
    this.mailService.sendStaffInvitationEmail(dto.email, token, dto.role, tenantId)

    return { message: `Invitation sent to ${dto.email}`, invitation }
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    this.logger.log(`${this.acceptInvitation.name} Service Called`);

    const invitation = await this.invitationRepo.findOne({ where: { token: dto.token } })

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation token.')
    }
    if (invitation.status !== InvitationStatus.Pending) {
      throw new BadRequestException('This invitation has already been used or expired.')
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.Expired
      await this.invitationRepo.save(invitation)
      throw new BadRequestException('This invitation has expired.')
    }

    // Check username uniqueness
    const existingUsername = await this.findUserByUsername(dto.username, invitation.tenantId)
    if (existingUsername) {
      throw new BadRequestException('This username is already taken.')
    }

    const user = await this.createUser(
      {
        name: dto.name,
        username: dto.username,
        password: dto.password,
        email: invitation.email,
        role: invitation.role,
        emailVerificationToken: null,
      },
      invitation.tenantId,
    )

    invitation.status = InvitationStatus.Accepted
    await this.invitationRepo.save(invitation)

    return { message: 'Account created successfully. You can now log in.', user }
  }

  async getInvitations(tenantId: string) {
    this.logger.log(`${this.getInvitations.name} Service Called`);
    return this.invitationRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async revokeInvitation(invitationId: string, tenantId: string) {
    this.logger.log(`${this.revokeInvitation.name} Service Called`);
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId, tenantId },
    })
    if (!invitation) {
      throw new NotFoundException('Invitation not found.')
    }
    if (invitation.status !== InvitationStatus.Pending) {
      throw new BadRequestException('Only pending invitations can be revoked.')
    }
    invitation.status = InvitationStatus.Expired
    return this.invitationRepo.save(invitation)
  }

  async getTeamMembers(tenantId: string) {
    this.logger.log(`${this.getTeamMembers.name} Service Called`);

    const [members, invitations] = await Promise.all([
      this.userRepo.find({
        where: { tenantId },
        order: { createdAt: 'DESC' },
        select: ['id', 'name', 'username', 'email', 'role', 'status', 'image', 'createdAt'],
      }),
      this.invitationRepo.find({
        where: { tenantId, status: InvitationStatus.Pending },
        order: { createdAt: 'DESC' },
      }),
    ])

    return { members, pendingInvitations: invitations }
  }

  async updateTeamMemberRole(memberId: string, role: UserRole, tenantId: string) {
    this.logger.log(`${this.updateTeamMemberRole.name} Service Called`);
    const user = await this.userRepo.findOne({ where: { id: memberId, tenantId } })
    if (!user) throw new NotFoundException('Team member not found.')
    user.role = role
    return this.userRepo.save(user)
  }
}
