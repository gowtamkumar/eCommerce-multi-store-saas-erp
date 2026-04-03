import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InvitationStatus, StaffInvitationEntity } from '../entities/staff-invitation.entity'

@Injectable()
export class StaffInvitationRepository {
  constructor(
    @InjectRepository(StaffInvitationEntity)
    private readonly repo: Repository<StaffInvitationEntity>,
  ) { }

  async expireOldInvitations(email: string, tenantId: string): Promise<void> {
    await this.repo.update(
      { email, tenantId, status: InvitationStatus.Pending },
      { status: InvitationStatus.Expired },
    )
  }

  async createAndSave(data: Partial<StaffInvitationEntity>): Promise<StaffInvitationEntity> {
    const invitation = this.repo.create(data as StaffInvitationEntity)
    return this.repo.save(invitation)
  }

  async findByToken(token: string): Promise<StaffInvitationEntity | null> {
    return this.repo.findOne({ where: { token } })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<StaffInvitationEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async findAllByTenant(tenantId: string): Promise<StaffInvitationEntity[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findPendingByTenant(tenantId: string): Promise<StaffInvitationEntity[]> {
    return this.repo.find({
      where: { tenantId, status: InvitationStatus.Pending },
      order: { createdAt: 'DESC' },
    })
  }

  async updateAndSave(
    invitation: StaffInvitationEntity,
    data: Partial<StaffInvitationEntity>,
  ): Promise<StaffInvitationEntity> {
    Object.assign(invitation, data)
    return this.repo.save(invitation)
  }
}
