'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { DiscountType } from '@/lib/enums/discount-type.enum';
import type { Coupon, CouponFormData } from '../types';

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;

const EMPTY_FORM: CouponFormData = {
    code: '',
    discountType: DiscountType.PERCENTAGE,
    amount: 0,
    minPurchaseAmount: 0,
    isActive: true,
};

function toDateInput(value?: string | null) {
    return value ? new Date(value).toISOString().split('T')[0] : '';
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useCouponForm(
    initialData: Coupon | null | undefined,
    isOpen: boolean,
    onSuccess: () => void,
) {
    const [formData, setFormData] = useState<CouponFormData>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: toDateInput(initialData.startDate),
                expiryDate: toDateInput(initialData.expiryDate),
            });
        } else {
            setFormData(EMPTY_FORM);
        }
    }, [initialData, isOpen]);

    const setField = useCallback(<K extends keyof CouponFormData>(field: K, value: CouponFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const generateCode = useCallback(() => {
        let code = '';
        for (let i = 0; i < CODE_LENGTH; i++) {
            code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
        }
        setFormData((prev) => ({ ...prev, code }));
    }, []);

    const submit = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            amount: Number(formData.amount),
            minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : 0,
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        };

        try {
            const url = initialData ? `/coupons/${initialData.id}` : '/coupons';
            const method = initialData ? 'PATCH' : 'POST';
            const res = await fetchAPI(url, { method, body: JSON.stringify(payload) });

            if (res.success || res.id) {
                toast.success(initialData ? 'Coupon updated' : 'Coupon created');
                onSuccess();
            } else {
                toast.error(res.message || 'Failed to save coupon');
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'An error occurred'));
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, onSuccess]);

    return {
        formData,
        loading,
        isEdit: Boolean(initialData),
        setField,
        generateCode,
        submit,
    };
}
