import { UserRole } from '@/common/enums/user/user-role.enum'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { CreateUserDto, FilterUserDto, UpdatePasswordDto, UpdateUserDto } from '../dtos'
import { AcceptInvitationDto, InviteStaffDto } from '../dtos/invite-staff.dto'
import { InvitationStatus } from '../entities/staff-invitation.entity'
import { UserEntity } from '../entities/user.entity'
import { StaffInvitationRepository } from '../repositories/staff-invitation.repository'
import { UserRepository } from '../repositories/user.repository'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private readonly userRepo: UserRepository,
    private readonly invitationRepo: StaffInvitationRepository,
    private readonly mailService: MailService,
  ) {}

  async getUsers(
    filterUserDto: FilterUserDto,
    tenantId: string,
  ): Promise<{ users: UserEntity[]; total: number }> {
    this.logger.log(`${this.getUsers.name} Service Called`)
    const [users, total] = await this.userRepo.findAllWithFilters(filterUserDto, tenantId)
    return { users, total }
  }

  async findAllUsersCrossTenant(): Promise<UserEntity[]> {
    this.logger.log(`${this.findAllUsersCrossTenant.name} Service Called`)
    return this.userRepo.findAllCrossTenant()
  }

  async getUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.getUser.name} Service Called`)
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundException(`User of id ${id} not found`)
    return user
  }

  async findOneUser(id: string, tenantId: string): Promise<UserEntity> {
    this.logger.log(`${this.findOneUser.name} Service Called`)
    const user = await this.userRepo.findByIdAndTenant(id, tenantId)
    if (!user) throw new NotFoundException(`User with id ${id} not found in this tenant.`)
    return user
  }

  async findUserById(id: string) {
    this.logger.log(`${this.findUserById.name} Service Called`)
    return this.userRepo.findById(id)
  }

  async findUserByUsername(username: string, tenantId?: string) {
    this.logger.log(`${this.findUserByUsername.name} Service Called`)
    return this.userRepo.findByUsername(username, tenantId)
  }

  async findUserByEmail(email: string, tenantId?: string) {
    this.logger.log(`${this.findUserByEmail.name} Service Called`)
    return this.userRepo.findByEmail(email, tenantId)
  }

  async createUser(createUserDto: CreateUserDto, tenantId?: string): Promise<UserEntity> {
    this.logger.log(`${this.createUser.name} Service Called`)
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = await this.userRepo.createAndSave({
      ...createUserDto,
      password: hashPassword,
      tenantId,
    })
    delete (user as any).password
    return user
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`${this.updateUser.name} Service Called`)
    const user = await this.getUser(id)
    return this.userRepo.updateAndSave(user, updateUserDto)
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<UserEntity> {
    this.logger.log(`${this.updatePassword.name} Service Called`)
    const { currentPassword, newPassword } = updatePasswordDto
    const user = await this.getUser(id)

    const valid = await this.validateUser(user, currentPassword)
    if (!valid) throw new UnauthorizedException('Password is not valid')

    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    return this.userRepo.updateAndSave(user, { password: newHashedPassword } as any)
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
    return this.userRepo.deleteUser(user)
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

  async updateResetToken(userId: string, token: string, expires: Date) {
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

  async countByTenant(tenantId: string) {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.userRepo.countByTenant(tenantId)
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    this.logger.log(`${this.setCurrentRefreshToken.name} Service Called`)
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userRepo.updateRefreshToken(userId, currentRefreshToken)
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    this.logger.log(`${this.getUserIfRefreshTokenMatches.name} Service Called`)
    const user = await this.userRepo.findUserWithRefreshToken(userId)

    if (!user || !user.refreshToken) return null

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken)
    if (isRefreshTokenMatching) return user
  }

  async removeRefreshToken(userId: string) {
    this.logger.log(`${this.removeRefreshToken.name} Service Called`)
    return this.userRepo.updateRefreshToken(userId, null)
  }

  async userOverview() {
    this.logger.log(`${this.userOverview.name} Service Called`)
    return this.userRepo.getOverviewStats()
  }

  // ─── Team / Staff Invitation Methods ───────────────────────────────────────

  async inviteStaff(dto: InviteStaffDto, tenantId: string, invitedBy: string) {
    this.logger.log(`${this.inviteStaff.name} Service Called`)

    const existingUser = await this.findUserByEmail(dto.email, tenantId)
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists in your team.')
    }

    await this.invitationRepo.expireOldInvitations(dto.email, tenantId)

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    const invitation = await this.invitationRepo.createAndSave({
      email: dto.email,
      role: dto.role,
      tenantId,
      token,
      expiresAt,
      invitedBy,
      status: InvitationStatus.Pending,
    })

    this.mailService.sendStaffInvitationEmail(dto.email, token, dto.role, tenantId)
    return { message: `Invitation sent to ${dto.email}`, invitation }
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    this.logger.log(`${this.acceptInvitation.name} Service Called`)
    const invitation = await this.invitationRepo.findByToken(dto.token)

    if (!invitation) throw new NotFoundException('Invalid or expired invitation token.')
    if (invitation.status !== InvitationStatus.Pending)
      throw new BadRequestException('This invitation has already been used or expired.')

    if (invitation.expiresAt < new Date()) {
      await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Expired })
      throw new BadRequestException('This invitation has expired.')
    }

    const existingUsername = await this.findUserByUsername(dto.username, invitation.tenantId)
    if (existingUsername) throw new BadRequestException('This username is already taken.')

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

    await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Accepted })
    return { message: 'Account created successfully. You can now log in.', user }
  }

  async getInvitations(tenantId: string) {
    this.logger.log(`${this.getInvitations.name} Service Called`)
    return this.invitationRepo.findAllByTenant(tenantId)
  }

  async revokeInvitation(invitationId: string, tenantId: string) {
    this.logger.log(`${this.revokeInvitation.name} Service Called`)
    const invitation = await this.invitationRepo.findByIdAndTenant(invitationId, tenantId)
    if (!invitation) throw new NotFoundException('Invitation not found.')
    if (invitation.status !== InvitationStatus.Pending)
      throw new BadRequestException('Only pending invitations can be revoked.')

    return this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Expired })
  }

  async getTeamMembers(tenantId: string) {
    this.logger.log(`${this.getTeamMembers.name} Service Called`)

    const [members, pendingInvitations] = await Promise.all([
      this.userRepo.findTeamMembers(tenantId),
      this.invitationRepo.findPendingByTenant(tenantId),
    ])

    return { members, pendingInvitations }
  }

  async updateTeamMemberRole(memberId: string, role: UserRole, tenantId: string) {
    this.logger.log(`${this.updateTeamMemberRole.name} Service Called`)
    const user = await this.userRepo.findByIdAndTenant(memberId, tenantId)
    if (!user) throw new NotFoundException('Team member not found.')
    return this.userRepo.updateAndSave(user, { role })
  }
}
