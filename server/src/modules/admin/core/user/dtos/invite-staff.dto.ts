import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { UserRole } from '@/common/enums/user/user-role.enum'

export class InviteStaffDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole

  @IsUUID()
  @IsOptional()
  branchId?: string

  @IsUUID()
  @IsOptional()
  warehouseId?: string

  @IsUUID()
  @IsOptional()
  roleId?: string
}

export class AcceptInvitationDto {
  @IsNotEmpty()
  token: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  password: string
}
