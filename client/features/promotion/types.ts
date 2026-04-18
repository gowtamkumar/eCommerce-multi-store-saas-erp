import { PromotionType } from "@/lib/enums/promotion-type.enum";

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



export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountAmount: number;
    images: string[];
    shortDescription?: string;
    stock: number;
    category?: { id: string; name: string; slug: string };
    brand?: { id: string; name: string };
    promoDiscount: number;
    promoDiscountPercentage: number;
    finalPrice: number;
    promotionId: string;
    promotionName: string;
    promotionType: PromotionType;
}


export interface Promotion {
    id: string;
    name: string;
    slug: string;
    description?: string;
    promotionType: PromotionType;
    value?: number;
    targetType: string;
    minOrderValue?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

export interface OfferGroup {
    promotion: Promotion;
    products: Product[];
}

export interface OffersPageProps {
    offerGroups: OfferGroup[];
    promotions: Promotion[];
    /** Passed from SSR to avoid a redundant client-side useSettings() fetch */
    offersSettings?: any;
}

export interface PromotionDetailsProps {
    promotion: Promotion;
    products: Product[];
}