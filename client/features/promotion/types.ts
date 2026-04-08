import { Promotion } from "@/services/promotion";

export interface PromotionPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PromotionListProps {
    promotions: Promotion[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    pagination: PromotionPagination;
    onPageChange: (page: number) => void;
    onEdit: (promotion: Promotion) => void;
    onDelete: (id: string) => void;
    onAddClick: () => void;
    onCopyOfferLink: (slug: string, id: string) => void;
    copiedId: string | null;
}

export type { Promotion };
