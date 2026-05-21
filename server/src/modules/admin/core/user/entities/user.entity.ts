import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { EmployeeEntity } from '@/modules/admin/operations/hrm/entities/employee.entity'
import { RoleEntity } from './role.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @Column({ type: 'uuid', name: 'role_id', nullable: true })
  roleId: string

  @ManyToOne(() => RoleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  roleEntity?: RoleEntity

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  @Index()
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: true })
  @Index()
  warehouseId: string

  @ManyToOne(() => WarehouseEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'credit_limit' })
  creditLimit: number

  @Column({ type: 'boolean', name: 'credit_hold', default: false })
  creditHold: boolean

  @Column({ type: 'varchar', name: 'membership_tier', length: 20, default: 'BRONZE' })
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

  @Column({ type: 'varchar', name: 'referral_code', length: 50, nullable: true })
  @Index({ unique: true, where: 'referral_code IS NOT NULL' })
  referralCode: string | null

  @Column({ type: 'uuid', name: 'referred_by_id', nullable: true })
  referredById: string | null

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'referred_by_id' })
  referredBy: UserEntity | null

  @Column({ type: 'integer', name: 'loyalty_points_balance', default: 0 })
  loyaltyPointsBalance: number

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tax_id' })
  taxId: string

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'company_name' })
  companyName: string

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'customer_code' })
  customerCode: string

  @Column({ type: 'uuid', name: 'preferred_branch_id', nullable: true })
  preferredBranchId: string

  @OneToOne(() => EmployeeEntity, (employee) => employee.user, { nullable: true })
  employee?: EmployeeEntity

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
