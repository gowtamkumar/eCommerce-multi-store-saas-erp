'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Tag, Megaphone, Trash2, Copy, Check, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { memo } from 'react';
import { Promotion, PromotionListProps } from '../types';

const PromotionRow = memo(({
    promo,
    currency,
    onEdit,
    onDelete,
    onCopyOfferLink,
    copiedId
}: {
    promo: Promotion;
    currency: string;
    onEdit: (promo: Promotion) => void;
    onDelete: (id: string) => void;
    onCopyOfferLink: (slug: string, id: string) => void;
    copiedId: string | null;
}) => {
    const formatTargetType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-2 group/name">
                    <div
                        className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-brand-600 transition-colors"
                        onClick={() => onEdit(promo)}
                    >
                        {promo.name}
                    </div>
                    <a
                        href={`/offers/${promo.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover/name:opacity-100 p-1 text-slate-400 hover:text-brand-600 transition-all"
                        title="View Public Page"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                        {promo.slug}
                    </span>
                    <button
                        onClick={() => onCopyOfferLink(promo.slug, promo.id)}
                        className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                        title="Copy Offer Link"
                    >
                        {copiedId === promo.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                </div>
                {promo.description && (
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{promo.description}</p>
                )}
            </td>
            <td className="p-4 font-medium" onClick={() => onEdit(promo)}>
                {promo.promotionType === 'free_shipping' ? (
                    <span className="text-brand-600 dark:text-brand-400">Free Shipping</span>
                ) : promo.promotionType === 'percentage' ? (
                    `${promo.value}% Off`
                ) : (
                    `${formatCurrency(promo.value || 0, currency)} Off`
                )}
            </td>
            <td className="p-4 cursor-pointer" onClick={() => onEdit(promo)}>
                <div className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        Targeting: {formatTargetType(promo.targetType)}
                    </span>
                    {promo.minOrderValue && promo.minOrderValue > 0 && (
                        <span className="text-xs text-slate-500">
                            Min Spend: {formatCurrency(promo.minOrderValue, currency)}
                        </span>
                    )}
                </div>
            </td>
            <td className="p-4 cursor-pointer" onClick={() => onEdit(promo)}>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${promo.isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="text-[10px] text-slate-400 mt-1">
                    {promo.endDate ? `Ends ${new Date(promo.endDate).toLocaleDateString()}` : 'No Expiry'}
                </div>
            </td>
            <td className="p-4 text-right">
                <button
                    onClick={() => onDelete(promo.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
});

PromotionRow.displayName = 'PromotionRow';

const PromotionList: React.FC<PromotionListProps> = ({
    promotions,
    loading,
    searchQuery,
    onSearchChange,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    onAddClick,
    onCopyOfferLink,
    copiedId
}) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-brand-600" />
                        Promotional Offers
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage automatic discounts, flash sales, and targeted brand offers
                    </p>
                </div>
                <button
                    onClick={onAddClick}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm shadow-brand-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Create Promotion
                </button>
            </div>

            {/* List/Table Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative z-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search promotional offers..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-12 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Offer Name</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Type / Value</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Conditions</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading && promotions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                                        </div>
                                        Loading promotional offers...
                                    </td>
                                </tr>
                            ) : promotions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                        <p>No promotional offers found.</p>
                                    </td>
                                </tr>
                            ) : (
                                promotions.map((promo) => (
                                    <PromotionRow
                                        key={promo.id}
                                        promo={promo}
                                        currency={currency}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onCopyOfferLink={onCopyOfferLink}
                                        copiedId={copiedId}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-medium text-slate-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900 dark:text-white">{pagination.total}</span> promotions
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1 || loading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => onPageChange(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${pagination.page === i + 1
                                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || loading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionList;
