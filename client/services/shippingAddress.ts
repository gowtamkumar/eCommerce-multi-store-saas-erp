import { ShippingZoneType } from '@/lib/enums/shipping-zone-type.enum';
import { fetchAPI } from './api';

export interface ShippingAddress {
    id: string;
    label?: string;
    recipientName: string;
    phone: string;
    address: string;
    city?: string;
    zone?: ShippingZoneType;
    isDefault: boolean;
}

export interface CreateShippingAddressPayload {
    recipientName: string;
    phone: string;
    address: string;
    label?: string;
    city?: string;
    zone?: ShippingZoneType;
    isDefault?: boolean;
}

export async function getShippingAddresses(): Promise<ShippingAddress[]> {
    const res = await fetchAPI('/store/shipping-address');
    return res?.data || [];
}

export async function createShippingAddress(data: CreateShippingAddressPayload): Promise<ShippingAddress> {
    const res = await fetchAPI('/store/shipping-address', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res?.data;
}

export async function updateShippingAddress(id: string, data: Partial<CreateShippingAddressPayload>): Promise<ShippingAddress> {
    const res = await fetchAPI(`/store/shipping-address/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return res?.data;
}

export async function setDefaultShippingAddress(id: string): Promise<ShippingAddress> {
    const res = await fetchAPI(`/store/shipping-address/${id}/default`, { method: 'PATCH' });
    return res?.data;
}

export async function deleteShippingAddress(id: string): Promise<void> {
    await fetchAPI(`/store/shipping-address/${id}`, { method: 'DELETE' });
}
