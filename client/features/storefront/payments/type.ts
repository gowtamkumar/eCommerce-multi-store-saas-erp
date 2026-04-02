export interface Payment {
    id: string;
    transactionId: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
    order: {
        customerName: string;
    };
}