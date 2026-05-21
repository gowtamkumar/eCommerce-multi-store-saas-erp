import { UserDto } from 'src/modules/admin/core/user/dtos/user.dto'

export class RequestContextDto {
  userId: string
  tenantId: string
  branchId?: string
  warehouseId?: string
  user: UserDto & { sessionId?: string }
  sessionId?: string
}
