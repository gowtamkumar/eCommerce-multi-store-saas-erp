'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { deletePromotion, getPromotions, Promotion } from '@/services/promotion';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { PromotionPagination } from '../types';
import PromotionList from './PromotionList';

// Lazy load the form to optimize initial bundle size
const PromotionForm = dynamic(() => import('./PromotionForm'), {
    loading: () => <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-96 rounded-2xl" />
});

export default function PromotionDashboard() {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    // State
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PromotionPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const loadPromotions = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const res = await getPromotions(page, pagination.limit, search);
            console.log("promotion", res);
            // Handle standard API response structure   
            if (res.success && res.data) {
                const data = res.data.promotions || [];
                const total = res.data.total || 0;

                setPromotions(data);
                setPagination(prev => ({
                    ...prev,
                    total,
                    totalPages: Math.ceil(total / prev.limit),
                    page
                }));
            } else {
                // Handle unexpected response shapes if any
                const data = res.promotions || res.data || [];
                const total = res.total || 0;
                setPromotions(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
            toast.error('Failed to load promotional offers');
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        loadPromotions(1, debouncedSearch);
    }, [debouncedSearch, loadPromotions]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotional offer?')) return;

        try {
            const res = await deletePromotion(id);
            if (res.success) {
                toast.success('Promotion deleted');
                loadPromotions(pagination.page, debouncedSearch);
            } else {
                toast.error(res.message || 'Failed to delete promotion');
            }
        } catch (error) {
            toast.error('Failed to delete promotion');
        }
    };

    const handleEdit = (promo: Promotion) => {
        setSelectedPromotion(promo);
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setSelectedPromotion(null);
        setIsFormOpen(true);
    };

    const copyOfferLink = (slug: string, id: string) => {
        const url = `${window.location.origin}/offers/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success('Offer link copied');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            <PromotionList
                promotions={promotions}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={pagination}
                onPageChange={(page: number) => loadPromotions(page)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddClick={handleAddClick}
                onCopyOfferLink={copyOfferLink}
                copiedId={copiedId}
            />

            {isFormOpen && (
                <PromotionForm
                    promotion={selectedPromotion}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadPromotions(pagination.page, debouncedSearch);
                    }}
                />
            )}
        </div>
    );
}
