export interface CartSummary {
    id: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    itemCount: number;
    totalAmount?: number;
    updatedAt?: string;
}
