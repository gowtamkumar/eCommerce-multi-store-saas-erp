import { PromotionType } from "@/lib/enums/promotion-type.enum";
import { PromotionTargetType } from "@/lib/enums/promotion-target-type.enum";
import type { Promotion as ServicePromotion } from "@/services/promotion";

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
    onCopyOfferLink: (slug: string, id: string) => void;
    copiedId: string | null;
}

export interface PromotionHeaderProps {
    onAddClick: () => void;
}

export interface PromotionSearchBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    loading: boolean;
}

export interface TargetOption {
    id: string;
    name: string;
}

export interface PromotionFormData {
    name: string;
    slug: string;
    description: string;
    promotionType: PromotionType;
    value: string;
    targetType: PromotionTargetType;
    targetId: string;
    minOrderValue: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface PromotionFormFieldsProps {
    formData: PromotionFormData;
    currency: string;
    brands: TargetOption[];
    categories: TargetOption[];
    products: TargetOption[];
    copied: boolean;
    onNameChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onFieldChange: <K extends keyof PromotionFormData>(field: K, value: PromotionFormData[K]) => void;
    onCopyLink: () => void;
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


export type Promotion = ServicePromotion;

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