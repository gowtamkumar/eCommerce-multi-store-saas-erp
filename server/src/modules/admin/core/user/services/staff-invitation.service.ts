import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { InviteStaffDto } from '../dtos/invite-staff.dto'
import { InvitationStatus, StaffInvitationEntity } from '../entities/staff-invitation.entity'
import { UserEntity } from '../entities/user.entity'
import { StaffInvitationRepository } from '../repositories/staff-invitation.repository'
import { UserRepository } from '../repositories/user.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRoleAssignmentEntity } from '../entities/user-role-assignment.entity'
import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { sanitizeInvitation, sanitizeUser } from '@/common/utils/sanitize-user.util'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'

@Injectable()
export class StaffInvitationService {
  private readonly logger = new Logger(StaffInvitationService.name)

  constructor(
    private readonly invitationRepo: StaffInvitationRepository,
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly assignmentRepo: Repository<UserRoleAssignmentEntity>,
    private readonly roleManagementService: RoleManagementService,
  ) {}

  async inviteStaff(
    dto: InviteStaffDto,
    ctx: RequestContextDto,
    checkExistingUser: (email: string, storeId: string) => Promise<any>,
  ): Promise<{ message: string; invitation: StaffInvitationEntity }> {
    this.logger.log(`${this.inviteStaff.name} Service Called`)
    const storeId = ctx.storeId
    const invitedBy = ctx.userId

    // Store staff can never be invited as a platform super admin, and only an
    // admin/super-admin may invite another store ADMIN. This prevents
    // privilege escalation through the invitation flow.
    if (dto.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('The super admin role cannot be assigned.')
    }
    const actorRole = (ctx.user?.role || '').toString().toLowerCase()
    const actorIsPrivileged =
      actorRole === UserRole.SUPER_ADMIN || actorRole === UserRole.ADMIN
    if (dto.role === UserRole.ADMIN && !actorIsPrivileged) {
      throw new BadRequestException('Only an administrator can invite an admin.')
    }

    const existingUser = await checkExistingUser(dto.email, storeId)
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists in your team.')
    }

    await this.invitationRepo.expireOldInvitations(dto.email, storeId)

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    const invitation = await this.invitationRepo.createAndSave(
      {
        email: dto.email,
        role: dto.role,
        token,
        expiresAt,
        invitedBy,
        status: InvitationStatus.Pending,
        branchId: dto.branchId || null,
        warehouseId: dto.warehouseId || null,
        roleId: dto.roleId || null,
      },
      ctx,
    )

    this.mailService.sendStaffInvitationEmail(dto.email, token, dto.role, storeId)
    await this.cacheService.delCache('team:members', storeId)

    return {
      message: `Invitation sent to ${dto.email}`,
      invitation: sanitizeInvitation(invitation) as StaffInvitationEntity,
    }
  }

  async getInvitations(ctx: RequestContextDto): Promise<StaffInvitationEntity[]> {
    this.logger.log(`${this.getInvitations.name} Service Called`)
    const storeId = ctx.storeId
    const invitations = await this.invitationRepo.findAllByStore(storeId)
    return invitations.map((inv) => sanitizeInvitation(inv) as StaffInvitationEntity)
  }

  async revokeInvitation(
    invitationId: string,
    ctx: RequestContextDto,
  ): Promise<StaffInvitationEntity> {
    this.logger.log(`${this.revokeInvitation.name} Service Called`)
    const storeId = ctx.storeId
    const invitation = await this.invitationRepo.findByIdAndStore(invitationId, storeId)
    if (!invitation) throw new NotFoundException('Invitation not found.')
    if (invitation.status !== InvitationStatus.Pending)
      throw new BadRequestException('Only pending invitations can be revoked.')

    const result = await this.invitationRepo.updateAndSave(invitation, {
      status: InvitationStatus.Expired,
    })
    await this.cacheService.delCache('team:members', storeId)
    return sanitizeInvitation(result) as StaffInvitationEntity
  }

  async findPendingByStore(ctx: RequestContextDto): Promise<StaffInvitationEntity[]> {
    const storeId = ctx.storeId
    const invitations = await this.invitationRepo.findPendingByStore(storeId)
    return invitations.map((inv) => sanitizeInvitation(inv) as StaffInvitationEntity)
  }

  async acceptInvitation(dto: any): Promise<{ message: string; user: UserEntity }> {
    this.logger.log(`${this.acceptInvitation.name} Service Called`)
    const { token, password, name, username } = dto

    const invitation = await this.invitationRepo.findByToken(token)
    if (!invitation) throw new NotFoundException('Invalid invitation token.')
    if (invitation.status !== InvitationStatus.Pending)
      throw new BadRequestException('This invitation is no longer active.')
    if (invitation.expiresAt < new Date()) {
      await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Expired })
      throw new BadRequestException('This invitation has expired.')
    }

    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(invitation.email, invitation.storeId)
    if (existingUser) throw new BadRequestException('A user with this email already exists.')

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.userRepo.createAndSave(
      {
        email: invitation.email,
        password: hashedPassword,
        name,
        username,
        role: invitation.role,
        roleId: invitation.roleId || null,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        branchId: invitation.branchId || null,
        warehouseId: invitation.warehouseId || null,
      },
      { storeId: invitation.storeId, userId: 'system' } as RequestContextDto,
    )

    // Create dynamic user role assignment if a dynamic role ID is linked to the invitation
    if (invitation.roleId) {
      const scopeType = invitation.branchId
        ? RoleScopeType.BRANCH
        : invitation.warehouseId
          ? RoleScopeType.WAREHOUSE
          : RoleScopeType.GLOBAL

      const assignment = this.assignmentRepo.create({
        userId: user.id,
        roleId: invitation.roleId,
        storeId: invitation.storeId,
        scopeType,
        scopeId: invitation.branchId || invitation.warehouseId || null,
        assignedBy: invitation.invitedBy || 'system',
      })
      await this.assignmentRepo.save(assignment)
    } else {
      await this.roleManagementService.ensureLegacyRoleAssignment(
        user.id,
        invitation.storeId,
        invitation.role,
        {
          branchId: invitation.branchId,
          warehouseId: invitation.warehouseId,
        },
      )
    }

    await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Accepted })
    await this.cacheService.delCache('team:members', invitation.storeId)

    // Trigger Notification for Admin
    try {
      await this.notificationService.createNotification(
        {
          title: 'Staff Invitation Accepted',
          message: `${name || username} (${invitation.email}) has accepted the invitation and joined the team as ${invitation.role}.`,
          type: 'SUCCESS',
          link: '/admin/settings/team',
          userId: null as any, // Send to all admins
        },
        invitation.storeId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger invitation acceptance notification: ${e.message}`)
    }

    return { message: 'Invitation accepted successfully.', user: sanitizeUser(user) as UserEntity }
  }
}
