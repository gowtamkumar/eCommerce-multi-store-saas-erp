import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole } from '../../../../common/enums/user/user-role.enum';
import { UserStatus } from '../../../../common/enums/user/user-status.enum';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => value || null)
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  username: string;

  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @IsEnum(UserStatus)
  status: UserStatus;
}
