import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'

export class UserResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  email: string

  @Expose()
  username: string

  @Expose()
  phone: string

  @Expose()
  address: string

  @Expose()
  image: string

  @Expose()
  isAdmin: boolean

  @Expose()
  isEmailVerified: boolean

  @Expose()
  role: UserRole

  @Expose()
  status: UserStatus

  @Expose()
  tenantId: string

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
