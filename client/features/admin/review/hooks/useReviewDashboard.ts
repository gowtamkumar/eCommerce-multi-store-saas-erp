'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { ReviewStatus } from '@/lib/enums/review-status.enum';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminReview, PaginationState } from '../types';

const PAGE_LIMIT = 10;

export function useReviewDashboard() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationState>({
        total: 0,
        page: 1,
        limit: PAGE_LIMIT,
        totalPages: 1
    });
    const [statusFilter, setStatusFilter] = useState<ReviewStatus>(ReviewStatus.PENDING);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 400);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const requestIdRef = useRef(0);

    const fetchReviews = useCallback(async (page: number, status: string, search: string) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: PAGE_LIMIT.toString(),
                status,
            });
            if (search.trim()) params.set('q', search.trim());

            const res = await fetchAPI(`/reviews?${params}`);
            if (requestId !== requestIdRef.current) return;

            if (res) {
                const resultData = res.data || res;
                const reviewsList: AdminReview[] = Array.isArray(resultData)
                    ? resultData
                    : resultData.reviews || [];
                const paginationData: PaginationState = res.pagination || resultData.pagination || {
                    total: reviewsList.length,
                    page,
                    limit: PAGE_LIMIT,
                    totalPages: 1
                };

                setReviews(reviewsList);
                setPagination(paginationData);
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error('Failed to fetch reviews', error);
            toast.error('Failed to load reviews');
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            void fetchReviews(1, statusFilter, debouncedSearch);
        }, 0);
        return () => clearTimeout(t);
    }, [statusFilter, debouncedSearch, fetchReviews]);

    const handleAction = useCallback(async (id: string, action: ReviewStatus | 'delete') => {
        if (action === 'delete') {
            setDeleteTarget(id);
            return;
        }

        try {
            const res = await fetchAPI(`/reviews/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: action })
            });
            if (res.success) {
                toast.success(`Review ${action}`);
                // The list is scoped to a single status, so a moderated review
                // no longer belongs in the current view — drop it.
                setReviews(prev => prev.filter(r => r.id !== id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            }
        } catch {
            toast.error('Action failed');
        }
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const id = deleteTarget;
        try {
            const res = await fetchAPI(`/reviews/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Review deleted');
                setReviews(prev => prev.filter(r => r.id !== id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            }
        } catch {
            toast.error('Action failed');
        } finally {
            setDeleteTarget(null);
        }
    }, [deleteTarget]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchReviews(newPage, statusFilter, debouncedSearch);
        }
    }, [pagination.totalPages, statusFilter, debouncedSearch, fetchReviews]);

    return {
        reviews,
        loading,
        pagination,
        statusFilter,
        setStatusFilter,
        searchInput,
        setSearchInput,
        deleteTarget,
        setDeleteTarget,
        debouncedSearch,
        fetchReviews,
        handleAction,
        confirmDelete,
        handlePageChange,
    };
}
