export interface User {
    id: string;
    name: string;
    email: string;
    username: string; // added back as seen in create user DTO
    role: string;
    phone?: string;
    status: string;
    createdAt: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CustomerListProps {
    users: User[];
    loading: boolean;
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
    onEdit: (user: User) => void;
    onAdd: () => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export interface CustomerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: User | null;
}
