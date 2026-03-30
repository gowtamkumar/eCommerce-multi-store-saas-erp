'use client';

import { fetchAPI } from '@/services/api';
import { ReviewStatus } from '@/lib/enums/review-status.enum';
import { Review } from '@/types/product';
import { ChevronLeft, ChevronRight, Loader2, Star, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });
    const [statusFilter, setStatusFilter] = useState<ReviewStatus>(ReviewStatus.PENDING);

    useEffect(() => {
        fetchReviews(1, statusFilter);
    }, [statusFilter]);

    const fetchReviews = async (page: number, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                status: status
            });
            const res = await fetchAPI(`/reviews?${params}`);
            if (res) {
                // Handle different response structures gracefully
                const resultData = res.data || res;
                const reviewsList = Array.isArray(resultData) ? resultData : resultData.reviews || [];
                const paginationData = resultData.pagination || {
                    total: reviewsList.length,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                };

                setReviews(reviewsList);
                setPagination(paginationData);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: ReviewStatus | 'delete') => {
        try {
            if (action === 'delete') {
                if (!confirm('Are you sure you want to delete this review?')) return;
                const res = await fetchAPI(`/reviews/${id}`, { method: 'DELETE' });
                if (res.success) {
                    toast.success('Review deleted');
                    fetchReviews(pagination.page, statusFilter);
                }
            } else {
                const res = await fetchAPI(`/reviews/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: action })
                });
                if (res.success) {
                    toast.success(`Review ${action}`);
                    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
                }
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchReviews(newPage, statusFilter);
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

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                    <option value={ReviewStatus.PENDING}>Pending</option>
                    <option value={ReviewStatus.APPROVED}>Approved</option>
                    <option value={ReviewStatus.REJECTED}>Rejected</option>
                </select>
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
                            <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
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
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{review.customerName}</span>
                                            <span className="text-xs text-slate-500">{review.customerEmail}</span>
                                        </div>
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
                                                onClick={() => handleAction(review.id, ReviewStatus.APPROVED)}
                                                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {review.status !== ReviewStatus.REJECTED && (
                                            <button
                                                onClick={() => handleAction(review.id, ReviewStatus.REJECTED)}
                                                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleAction(review.id, 'delete')}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">Page {pagination.page} of {pagination.totalPages}</span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
