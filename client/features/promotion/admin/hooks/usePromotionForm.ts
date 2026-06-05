'use client';

import { PromotionTargetType } from '@/lib/enums/promotion-target-type.enum';
import { PromotionType } from '@/lib/enums/promotion-type.enum';
import { fetchAPI } from '@/services/api';
import { createPromotion, updatePromotion, type Promotion } from '@/services/promotion';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type { PromotionFormData, TargetOption } from '../../types';

const TARGET_TYPES_REQUIRING_ID = [
    PromotionTargetType.SPECIFIC_PRODUCT,
    PromotionTargetType.SPECIFIC_CATEGORY,
    PromotionTargetType.SPECIFIC_BRAND,
];

const EMPTY_FORM: PromotionFormData = {
    name: '',
    slug: '',
    description: '',
    promotionType: PromotionType.PERCENTAGE,
    value: '',
    targetType: PromotionTargetType.ENTIRE_ORDER,
    targetId: '',
    minOrderValue: '',
    startDate: '',
    endDate: '',
    isActive: true,
};

export function generateSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

function toDateInput(value?: string | null) {
    return value ? new Date(value).toISOString().split('T')[0] : '';
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function usePromotionForm(
    promotion: Promotion | null | undefined,
    onSuccess: () => void,
) {
    const [formData, setFormData] = useState<PromotionFormData>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [brands, setBrands] = useState<TargetOption[]>([]);
    const [categories, setCategories] = useState<TargetOption[]>([]);
    const [products, setProducts] = useState<TargetOption[]>([]);

    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const [brand, category, product] = await Promise.all([
                    fetchAPI('/brands'),
                    fetchAPI('/categories'),
                    fetchAPI('/products?limit=100'),
                ]);
                setBrands(brand.data || []);
                setCategories(category.data || []);
                setProducts(product?.data || []);
            } catch (error) {
                console.error('Failed to load promotion target options', error);
            }
        };
        void fetchLookups();
    }, []);

    useEffect(() => {
        if (promotion) {
            setFormData({
                name: promotion.name || '',
                slug: promotion.slug || '',
                description: promotion.description || '',
                promotionType: promotion.promotionType || PromotionType.PERCENTAGE,
                value: promotion.value ? String(promotion.value) : '',
                targetType: promotion.targetType || PromotionTargetType.ENTIRE_ORDER,
                targetId: promotion.targetId || '',
                minOrderValue: promotion.minOrderValue ? String(promotion.minOrderValue) : '',
                startDate: toDateInput(promotion.startDate),
                endDate: toDateInput(promotion.endDate),
                isActive: promotion.isActive ?? true,
            });
        } else {
            setFormData(EMPTY_FORM);
        }
    }, [promotion]);

    const setField = useCallback(<K extends keyof PromotionFormData>(field: K, value: PromotionFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Auto-sync slug while it still mirrors the (previous) name-derived slug.
    const changeName = useCallback((newName: string) => {
        setFormData((prev) => {
            const shouldSyncSlug = !prev.slug || prev.slug === generateSlug(prev.name);
            return shouldSyncSlug
                ? { ...prev, name: newName, slug: generateSlug(newName) }
                : { ...prev, name: newName };
        });
    }, []);

    const changeSlug = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }, []);

    const copyOfferUrl = useCallback(() => {
        const url = `${window.location.origin}/offers/${formData.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Offer URL copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    }, [formData.slug]);

    const submit = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const payload: Partial<Promotion> = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            promotionType: formData.promotionType,
            targetType: formData.targetType,
            isActive: formData.isActive,
        };

        if (formData.value) payload.value = Number(formData.value);
        if (formData.minOrderValue) payload.minOrderValue = Number(formData.minOrderValue);

        if (TARGET_TYPES_REQUIRING_ID.includes(formData.targetType)) {
            if (!formData.targetId) {
                toast.error('Please select a target item');
                setLoading(false);
                return;
            }
            payload.targetId = formData.targetId;
        }

        if (formData.startDate) payload.startDate = new Date(formData.startDate).toISOString();
        if (formData.endDate) payload.endDate = new Date(formData.endDate).toISOString();

        try {
            const res = promotion?.id
                ? await updatePromotion(promotion.id, payload)
                : await createPromotion(payload);

            if (res && !res.error) {
                toast.success(promotion ? 'Promotion updated' : 'Promotion created');
                onSuccess();
            } else {
                toast.error(res?.message || 'Failed to save promotion');
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'An error occurred while saving.'));
        } finally {
            setLoading(false);
        }
    }, [formData, promotion, onSuccess]);

    return {
        formData,
        loading,
        copied,
        brands,
        categories,
        products,
        isEdit: Boolean(promotion),
        setField,
        changeName,
        changeSlug,
        copyOfferUrl,
        submit,
    };
}
