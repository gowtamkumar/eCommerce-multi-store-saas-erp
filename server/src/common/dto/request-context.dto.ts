import { UserDto } from 'src/modules/admin/user/dtos/user.dto';

export class RequestContextDto {
  userId: string;
  tenantId: string;
  user: UserDto;
}
