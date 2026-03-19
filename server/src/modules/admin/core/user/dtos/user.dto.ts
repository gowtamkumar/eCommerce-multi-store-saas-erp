import { IsBoolean, IsDate, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@/common/enums/user/user-role.enum';
import { UserStatus } from '@/common/enums/user/user-status.enum';

export class UserDto {
    @IsString()
    id: string;
    @IsString()
    name: string;
    @IsString()
    email: string;
    @IsString()
    username: string;
    @IsString()
    phone?: string;
    @IsString()
    address?: string;
    @IsString()
    image?: string;
    @IsBoolean()
    isAdmin: boolean;
    @IsBoolean()
    isEmailVerified: boolean;
    @IsEnum(UserRole)
    role: UserRole;
    @IsEnum(UserStatus)
    status: UserStatus;
    @IsString()
    tenantId: string;
    @IsDate()
    createdAt: Date;
    @IsDate()
    updatedAt: Date;
}
