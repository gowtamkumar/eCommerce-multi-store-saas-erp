import type { Pagination } from '../customer/type';

export type SubscriberStatus = 'pending' | 'confirmed' | 'unsubscribed' | 'suppressed';

export interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    status?: SubscriberStatus;
    source?: string | null;
    confirmedAt?: string | null;
    unsubscribedAt?: string | null;
    createdAt: string;
}

export interface SubscribersHeaderProps {
    onExport: () => void;
    exporting: boolean;
}

export interface SubscribersFiltersProps {
    searchQuery: string;
    total: number;
    onSearchChange: (value: string) => void;
}

export interface SubscribersTableProps {
    subscribers: Subscriber[];
    loading: boolean;
    searchQuery: string;
    pagination: Pagination;
    onPageChange: (page: number) => void;
}
