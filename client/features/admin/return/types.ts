export interface ReturnRequest {
    id: string;
    orderId: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    reason: string;
    user?: {
        name: string;
        email: string;
    };
    order?: {
        id: string;
        customerName: string;
        customerEmail: string;
        items?: any[];
    };
    items: any[];
    createdAt: string;
    adminComment?: string;
}

export interface ReturnListProps {
    returns: ReturnRequest[];
    loading: boolean;
    onStatusUpdate: (id: string, status: string, comment?: string) => void;
}


export interface ReturnModalProps {
    orderId: string;
    item: {
        id: string; // Order Item ID (not used for logic but unique key)
        productId: string;
        variantId?: string;
        productName: string;
        quantity: number;
        price: number;
        discount: number;
    };
    onClose: () => void;
    onSuccess: () => void;
}