'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import Pagination from '@/components/shared/Pagination';
import { ReviewStatus } from '@/lib/enums/review-status.enum';
import { Loader2, Search, Star, X } from 'lucide-react';
import { useReviewDashboard } from '../hooks/useReviewDashboard';
import { ReviewCard } from './ReviewCard';

export default function Reviews() {
    const {
        reviews,
        loading,
        pagination,
        statusFilter,
        setStatusFilter,
        searchInput,
        setSearchInput,
        deleteTarget,
        setDeleteTarget,
        handleAction,
        confirmDelete,
        handlePageChange,
    } = useReviewDashboard();

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
