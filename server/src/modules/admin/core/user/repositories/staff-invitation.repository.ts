import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InvitationStatus, StaffInvitationEntity } from '../entities/staff-invitation.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class StaffInvitationRepository extends BaseStoreRepository<StaffInvitationEntity> {
  constructor(
    @InjectRepository(StaffInvitationEntity)
    repo: Repository<StaffInvitationEntity>,
  ) {
    super(StaffInvitationEntity, repo)
}

  async expireOldInvitations(email: string, storeId: string): Promise<void> {
    await this.repo.update(
      { email, storeId, status: InvitationStatus.Pending },
      { status: InvitationStatus.Expired },
    )
  }

  async createAndSave(
    data: Partial<StaffInvitationEntity>,
    ctx: RequestContextDto,
  ): Promise<StaffInvitationEntity> {
    const invitation = this.repo.create({
      ...data,
      storeId: data.storeId || ctx.storeId,
    } as StaffInvitationEntity)
    return this.repo.save(invitation)
  }

  async findByToken(token: string): Promise<StaffInvitationEntity | null> {
    return this.repo.findOne({ where: { token } })
  }

  async findByIdAndStore(id: string, storeId: string): Promise<StaffInvitationEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async findAllByStore(storeId: string): Promise<StaffInvitationEntity[]> {
    return this.repo.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    })
  }

  async findPendingByStore(storeId: string): Promise<StaffInvitationEntity[]> {
    return this.repo.find({
      where: { storeId, status: InvitationStatus.Pending },
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
