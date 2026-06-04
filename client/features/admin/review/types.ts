import { ReviewStatus } from '@/lib/enums/review-status.enum';

export interface AdminReview {
    id: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
    createdAt: string;
    user?: {
        name?: string;
        username?: string;
        email?: string;
    } | null;
    product?: {
        name?: string;
    } | null;
    // Legacy/flat fallbacks in case the API flattens the relation
    customerName?: string;
    customerEmail?: string;
}

export interface PaginationState {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
