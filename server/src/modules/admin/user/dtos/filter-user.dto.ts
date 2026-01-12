import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../../common/enums/user/user-role.enum';
import { UserStatus } from '../../../../common/enums/user/user-status.enum';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class FilterUserDto extends PaginationDto {
  @IsOptional()
  name: string;

  @IsOptional()
  email: string;

  @IsOptional()
  username: string;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @IsEnum(UserStatus)
  @IsOptional()
  status: UserStatus;
}
