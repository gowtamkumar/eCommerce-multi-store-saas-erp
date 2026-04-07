export interface TrackedOrder {
    id: string;
    customerName: string;
    customerPhone: string;
    courierStatus: string;
    trackingId?: string;
    createdAt: string;
    status: string;
}

export interface CourierIntegrationsProps {
    settings: any;
    isPathaoConnected: boolean;
    isSteadfastConnected: boolean;
}

export interface CourierActivityListProps {
    orders: TrackedOrder[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}
