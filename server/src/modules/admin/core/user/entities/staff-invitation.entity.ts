import { Column, Entity } from 'typeorm'
import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserRole } from '@/common/enums/user/user-role.enum'

export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Expired = 'expired',
}

@Entity('staff_invitations')
export class StaffInvitationEntity extends BaseEntity {
  @Column()
  email: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OPERATOR })
  role: UserRole

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string

  @Column({ unique: true })
  token: string

  @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.Pending })
  status: InvitationStatus

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date

  @Column({ name: 'invited_by', type: 'uuid', nullable: true })
  invitedBy: string

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: true })
  warehouseId: string

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string
}
