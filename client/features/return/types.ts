export interface ReturnRequest {
    id: string;
    orderId: string;
    status: string;
    reason: string;
    users: {
        name: string;
        email: string;
    };
    order: {
        id: string;
        customerName: string;
        items?: any[];
    };
    items: any[];
    createdAt: string;
    adminComment?: string;
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