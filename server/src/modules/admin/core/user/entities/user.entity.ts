import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('users')
@Index(['username', 'tenantId'], { unique: true })
@Index(['email', 'tenantId'], { unique: true })
@Index(['tenantId'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @Column({ nullable: true, name: 'push_token' })
  pushToken: string

  @Column({ nullable: true, name: 'fcm_token' })
  fcmToken: string

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
    default: UserRole.USER,
  })
  role: UserRole

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
