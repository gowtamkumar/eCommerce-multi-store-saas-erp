import { ReturnStatus } from "@/lib/enums/return-status.enum";

export interface DisplayItem {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    avatar: string;

}



export interface OrderListItemProps {
    order: any;
    formatPrice: (price: number) => string;
    onViewDetail: (order: any) => void;
    onDownloadInvoice: (order: any) => void;
    getReturnStatus: (order: any, productId: string, variantId?: string) => ReturnStatus | null;
}

export interface OrderDetailModalProps {
    order: any;
    formatPrice: (price: number) => string;
    onClose: () => void;
    onDownloadInvoice: (order: any) => void;
    onWriteReview: (item: any) => void;
    onReturnItem: (item: any) => void;
    getReturnStatus: (order: any, productId: string, variantId?: string) => ReturnStatus | null;
}
