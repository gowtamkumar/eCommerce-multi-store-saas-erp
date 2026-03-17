import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from 'src/common/enums/user/user-role.enum';

export class InviteStaffDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

export class AcceptInvitationDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
