import { fetchAPI } from "./api";

export interface Promotion {
    id: string;
    name: string;
    description?: string;
    promotionType: 'percentage' | 'fixed_amount' | 'free_shipping' | 'bogo';
    value?: number;
    targetType: 'entire_order' | 'specific_product' | 'specific_category' | 'specific_brand' | 'minimum_cart_value';
    targetId?: string;
    minOrderValue?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getPromotions = async (page = 1, limit = 10, search = "", isActive?: boolean) => {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${search}`;
    if (isActive !== undefined) query += `&isActive=${isActive}`;

    const response = await fetchAPI(`/promotions${query}`);
    return response; // Expected to return { promotions: Promotion[], total: number }
};

export const getPromotionById = async (id: string) => {
    const response = await fetchAPI(`/promotions/${id}`);
    return response;
};

export const createPromotion = async (data: Partial<Promotion>) => {
    const response = await fetchAPI(`/promotions`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
};

export const updatePromotion = async (id: string, data: Partial<Promotion>) => {
    const response = await fetchAPI(`/promotions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return response;
};

export const deletePromotion = async (id: string) => {
    const response = await fetchAPI(`/promotions/${id}`, {
        method: "DELETE",
    });
    return response;
};
