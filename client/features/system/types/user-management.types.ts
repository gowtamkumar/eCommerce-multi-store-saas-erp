import { UserRole } from '@/lib/enums/user-role.enum';
import { UserStatus } from '@/lib/enums/user-status.enum';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  username: string;
  phone?: string;
  address?: string;
  tenantId?: {
    id: string;
    storeName: string;
    subdomain: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListProps {
  initialUsers: User[];
  initialPagination: PaginationMeta;
}

export interface UserFilterParams {
  page: number;
  limit: number;
  q: string;
  role?: string;
  status?: string;
}
