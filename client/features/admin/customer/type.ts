export interface User {
    id: string;
    name: string;
    email: string;
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
