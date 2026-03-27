import { PromotionType } from "@/lib/enums/promotion-type.enum";
import { PromotionTargetType } from "@/lib/enums/promotion-target-type.enum";
import { fetchAPI } from "./api";

export interface Promotion {
    id: string;
    slug: string;
    name: string;
    description?: string;
    promotionType: PromotionType;
    value?: number;
    targetType: PromotionTargetType;
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

export const getOfferProducts = async () => {
    const response = await fetchAPI('/promotions/offers');
    return response; // { data: { promotions, offerGroups: [{ promotion, products }] } }
};

export const getPromotionBySlug = async (slug: string) => {
    const response = await fetchAPI(`/promotions/slug/${slug}`);
    return response; // { data: { promotion, products } }
};
