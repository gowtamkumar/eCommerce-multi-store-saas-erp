import type { LeadStatus } from '@/lib/enums/lead-status.enum';
import type { Pagination } from '../customer/type';

export interface LeadMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message?: string;
    status: LeadStatus;
    createdAt: string;
}

export interface LeadsHeaderProps {
    onExport: () => void;
    exporting: boolean;
}

export interface LeadsFiltersProps {
    searchQuery: string;
    statusFilter: string;
    total: number;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}

export interface LeadsTableProps {
    leads: LeadMessage[];
    loading: boolean;
    searchQuery: string;
    pagination: Pagination;
    updatingStatus: string | null;
    onPageChange: (page: number) => void;
    onStatusUpdate: (id: string, newStatus: LeadStatus) => void;
}
