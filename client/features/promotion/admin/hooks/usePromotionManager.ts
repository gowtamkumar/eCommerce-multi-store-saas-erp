'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { deletePromotion, getPromotions, type Promotion } from '@/services/promotion';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { PromotionPagination } from '../../types';

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function usePromotionManager() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PromotionPagination>({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const loadPromotions = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const res = await getPromotions(page, PAGE_SIZE, search);
            if (res.success && res.data) {
                const total = res.data.total || 0;
                setPromotions(res.data.promotions || []);
                setPagination((prev) => ({
                    ...prev,
                    total,
                    totalPages: Math.ceil(total / prev.limit),
                    page,
                }));
            } else {
                const data = res.promotions || res.data || [];
                setPromotions(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
            toast.error(getErrorMessage(error, 'Failed to load promotional offers'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPromotions(1, debouncedSearch);
    }, [debouncedSearch, loadPromotions]);

    const refresh = useCallback(() => {
        void loadPromotions(pagination.page, debouncedSearch);
    }, [loadPromotions, pagination.page, debouncedSearch]);

    const deletePromotionById = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotional offer?')) return;
        try {
            const res = await deletePromotion(id);
            if (res.success) {
                toast.success('Promotion deleted');
                refresh();
            } else {
                toast.error(res.message || 'Failed to delete promotion');
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete promotion'));
        }
    }, [refresh]);

    const openEdit = useCallback((promo: Promotion) => {
        setSelectedPromotion(promo);
        setIsFormOpen(true);
    }, []);

    const openCreate = useCallback(() => {
        setSelectedPromotion(null);
        setIsFormOpen(true);
    }, []);

    const closeForm = useCallback(() => setIsFormOpen(false), []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        refresh();
    }, [refresh]);

    const changePage = useCallback((page: number) => {
        void loadPromotions(page, debouncedSearch);
    }, [loadPromotions, debouncedSearch]);

    const copyOfferLink = useCallback((slug: string, id: string) => {
        const url = `${window.location.origin}/offers/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success('Offer link copied');
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    return {
        promotions,
        loading,
        searchQuery,
        pagination,
        isFormOpen,
        selectedPromotion,
        copiedId,
        setSearchQuery,
        deletePromotionById,
        openEdit,
        openCreate,
        closeForm,
        handleFormSuccess,
        changePage,
        copyOfferLink,
    };
}
