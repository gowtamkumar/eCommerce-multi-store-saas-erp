import { DiscountType } from '@/lib/enums/discount-type.enum';

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    discountType: DiscountType | string;
    amount: number;
    minPurchaseAmount: number;
    usageLimit?: number | null;
    usedCount: number;
    startDate?: string | null;
    expiryDate?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CouponPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CouponListProps {
    coupons: Coupon[];
    loading: boolean;
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: string) => void;
    pagination: CouponPagination;
    onPageChange: (page: number) => void;
}

export interface CouponHeaderProps {
    onAdd: () => void;
}

export interface CouponFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    isSearchLoading?: boolean;
}

export interface CouponFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Coupon | null;
}

export type CouponFormData = Partial<Coupon>;

export interface CouponFormFieldsProps {
    formData: CouponFormData;
    currency: string;
    onChange: <K extends keyof CouponFormData>(field: K, value: CouponFormData[K]) => void;
    onGenerateCode: () => void;
}
