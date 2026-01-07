import { Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { UserRole } from '../../../../common/enums/user/user-role.enum';
import { UserStatus } from '../../../../common/enums/user/user-status.enum';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  isAdmin: boolean;

  @Expose()
  roles: UserRole[];

  @Expose()
  status: UserStatus;
}
