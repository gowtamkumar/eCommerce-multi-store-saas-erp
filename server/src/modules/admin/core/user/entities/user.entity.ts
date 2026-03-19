import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('users')
@Index(['username', 'tenantId'], { unique: true })
@Index(['email', 'tenantId'], { unique: true })
export class UserEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  email: string

  @Column()
  username: string

  @Column()
  password: string

  @Column({ nullable: true })
  phone: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ nullable: true })
  image: string

  // system super admin
  @Column({ default: false, name: 'is_admin' })
  isAdmin: boolean

  @Column({ default: false, name: 'is_email_verified' })
  isEmailVerified: boolean

  @Column({ nullable: true, name: 'email_verification_token' })
  emailVerificationToken: string

  @Column({ nullable: true, name: 'reset_password_token' })
  resetPasswordToken: string

  @Column({ type: 'timestamptz', nullable: true, name: 'reset_password_expires' })
  resetPasswordExpires: Date

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.Active })
  status: UserStatus

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
