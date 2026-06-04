'use client';

import { fetchAPI } from '@/services/api';
import { ReviewStatus } from '@/lib/enums/review-status.enum';
import { useDebounce } from '@/hooks/useDebounce';
import { Star, Trash2, Box, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import toast from 'react-hot-toast';
import Pagination from '@/components/shared/Pagination';
import ConfirmModal from '@/components/shared/ConfirmModal';

interface AdminReview {
    id: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
    createdAt: string;
    user?: {
        name?: string;
        username?: string;
        email?: string;
    } | null;
    product?: {
        name?: string;
    } | null;
    // Legacy/flat fallbacks in case the API flattens the relation
    customerName?: string;
    customerEmail?: string;
}

interface PaginationState {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const PAGE_LIMIT = 10;

const getReviewerName = (review: AdminReview) =>
    review.user?.name || review.user?.username || review.customerName || 'Anonymous';

const getReviewerEmail = (review: AdminReview) =>
    review.user?.email || review.customerEmail || '';

const ReviewCard = memo(({
    review,
    onAction
}: {
    review: AdminReview;
    onAction: (id: string, action: ReviewStatus | 'delete') => void;
}) => {
    return (
        <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{getReviewerName(review)}</span>
                        <span className="text-xs text-slate-500">{getReviewerEmail(review)}</span>
                    </div>

                    {review.product?.name && (
                        <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-brand-600 bg-brand-50 w-fit px-2 py-0.5 rounded-md dark:bg-brand-900/40 dark:text-brand-400">
                            <Box className="w-3 h-3" />
                            {review.product.name}
                        </div>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded-full ${review.status === ReviewStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                review.status === ReviewStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                            {review.status}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {review.status !== ReviewStatus.APPROVED && (
                        <button
                            onClick={() => onAction(review.id, ReviewStatus.APPROVED)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                        >
                            Approve
                        </button>
                    )}
                    {review.status !== ReviewStatus.REJECTED && (
                        <button
                            onClick={() => onAction(review.id, ReviewStatus.REJECTED)}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                        >
                            Reject
                        </button>
                    )}
                    <button
                        onClick={() => onAction(review.id, 'delete')}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

ReviewCard.displayName = 'ReviewCard';


export default function Reviews() {
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

    const handleAction = async (id: string, action: ReviewStatus | 'delete') => {
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
    };

    const confirmDelete = async () => {
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
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchReviews(newPage, statusFilter, debouncedSearch);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                        <Star className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Product Reviews</h1>
                        <p className="text-slate-500 dark:text-slate-400">Moderate and manage customer feedback</p>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by customer, product, or comment..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                    <option value={ReviewStatus.PENDING}>Pending</option>
                    <option value={ReviewStatus.APPROVED}>Approved</option>
                    <option value={ReviewStatus.REJECTED}>Rejected</option>
                </select>
                <span className="text-sm text-slate-500 dark:text-slate-400 sm:ml-auto">
                    {pagination.total} {pagination.total === 1 ? 'review' : 'reviews'}
                </span>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {loading ? (
                        <div className="p-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
                            <p className="text-slate-500">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="p-20 text-center text-slate-500 dark:text-slate-400">
                            No reviews found.
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onAction={handleAction}
                            />
                        ))
                    )}
                </div>
            </div>

            {pagination.totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                isDangerous
            />
        </div>
    );
}
