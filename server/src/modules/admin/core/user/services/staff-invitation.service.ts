import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service';
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service';
import { StaffInvitationRepository } from '../repositories/staff-invitation.repository';
import { InviteStaffDto } from '../dtos/invite-staff.dto';
import { InvitationStatus, StaffInvitationEntity } from '../entities/staff-invitation.entity';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { UserStatus } from '@/common/enums/user/user-status.enum';
import { RequestContextDto } from '@/common/dto/request-context.dto';

@Injectable()
export class StaffInvitationService {
  private readonly logger = new Logger(StaffInvitationService.name);

  constructor(
    private readonly invitationRepo: StaffInvitationRepository,
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
  ) {}

  async inviteStaff(
    dto: InviteStaffDto,
    ctx: RequestContextDto,
    checkExistingUser: (email: string, tenantId: string) => Promise<any>
  ): Promise<{ message: string; invitation: StaffInvitationEntity }> {
    this.logger.log(`${this.inviteStaff.name} Service Called`);
    const tenantId = ctx.tenantId;
    const invitedBy = ctx.userId;

    const existingUser = await checkExistingUser(dto.email, tenantId);
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists in your team.');
    }

    await this.invitationRepo.expireOldInvitations(dto.email, tenantId);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invitation = await this.invitationRepo.createAndSave({
      email: dto.email,
      role: dto.role,
      tenantId,
      token,
      expiresAt,
      invitedBy,
      status: InvitationStatus.Pending,
    });

    this.mailService.sendStaffInvitationEmail(dto.email, token, dto.role, tenantId);
    await this.cacheService.delCache('team:members', tenantId);
    
    return { message: `Invitation sent to ${dto.email}`, invitation };
  }

  async getInvitations(ctx: RequestContextDto): Promise<StaffInvitationEntity[]> {
    this.logger.log(`${this.getInvitations.name} Service Called`);
    const tenantId = ctx.tenantId;
    return this.invitationRepo.findAllByTenant(tenantId);
  }

  async revokeInvitation(invitationId: string, ctx: RequestContextDto): Promise<StaffInvitationEntity> {
    this.logger.log(`${this.revokeInvitation.name} Service Called`);
    const tenantId = ctx.tenantId;
    const invitation = await this.invitationRepo.findByIdAndTenant(invitationId, tenantId);
    if (!invitation) throw new NotFoundException('Invitation not found.');
    if (invitation.status !== InvitationStatus.Pending)
      throw new BadRequestException('Only pending invitations can be revoked.');

    const result = await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Expired });
    await this.cacheService.delCache('team:members', tenantId);
    return result;
  }

  async findPendingByTenant(ctx: RequestContextDto): Promise<StaffInvitationEntity[]> {
    const tenantId = ctx.tenantId;
    return this.invitationRepo.findPendingByTenant(tenantId);
  }

  async acceptInvitation(dto: any): Promise<{ message: string; user: UserEntity }> {
    this.logger.log(`${this.acceptInvitation.name} Service Called`);
    const { token, password, name, username } = dto;

    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation) throw new NotFoundException('Invalid invitation token.');
    if (invitation.status !== InvitationStatus.Pending)
      throw new BadRequestException('This invitation is no longer active.');
    if (invitation.expiresAt < new Date()) {
      await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Expired });
      throw new BadRequestException('This invitation has expired.');
    }

    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(invitation.email, invitation.tenantId);
    if (existingUser) throw new BadRequestException('A user with this email already exists.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepo.createAndSave({
      email: invitation.email,
      password: hashedPassword,
      name,
      username,
      role: invitation.role,
      tenantId: invitation.tenantId,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    });

    await this.invitationRepo.updateAndSave(invitation, { status: InvitationStatus.Accepted });
    await this.cacheService.delCache('team:members', invitation.tenantId);

    return { message: 'Invitation accepted successfully.', user };
  }
}
