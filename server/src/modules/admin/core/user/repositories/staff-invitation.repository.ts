import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { StaffInvitationEntity, InvitationStatus } from '../entities/staff-invitation.entity'

@Injectable()
export class StaffInvitationRepository extends Repository<StaffInvitationEntity> {
  constructor(private dataSource: DataSource) {
    super(StaffInvitationEntity, dataSource.createEntityManager())
  }

  async expireOldInvitations(email: string, tenantId: string): Promise<void> {
    await this.update(
      { email, tenantId, status: InvitationStatus.Pending },
      { status: InvitationStatus.Expired },
    )
  }

  async createAndSave(data: Partial<StaffInvitationEntity>): Promise<StaffInvitationEntity> {
    const invitation = this.create(data as StaffInvitationEntity)
    return this.save(invitation)
  }

  async findByToken(token: string): Promise<StaffInvitationEntity | null> {
    return this.findOne({ where: { token } })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<StaffInvitationEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async findAllByTenant(tenantId: string): Promise<StaffInvitationEntity[]> {
    return this.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findPendingByTenant(tenantId: string): Promise<StaffInvitationEntity[]> {
    return this.find({
      where: { tenantId, status: InvitationStatus.Pending },
      order: { createdAt: 'DESC' },
    })
  }

  async updateAndSave(
    invitation: StaffInvitationEntity,
    data: Partial<StaffInvitationEntity>,
  ): Promise<StaffInvitationEntity> {
    Object.assign(invitation, data)
    return this.save(invitation)
  }
}
