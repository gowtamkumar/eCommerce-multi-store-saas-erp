import { UserRole } from 'src/common/enums/user/user-role.enum';
import { UserStatus } from 'src/common/enums/user/user-status.enum';

export class UserDto {
    id: string;
    name: string;
    email: string;
    username: string;
    phone?: string;
    address?: string;
    image?: string;
    isAdmin: boolean;
    isEmailVerified: boolean;
    role: UserRole;
    status: UserStatus;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
