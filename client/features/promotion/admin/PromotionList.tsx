'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Tag, Megaphone, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import React, { memo, useMemo, useCallback } from 'react';
import { Promotion, PromotionListProps } from '../types';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

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

    const formatTargetType = useCallback((type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }, []);

    const columns = useMemo<DataTableColumn<Promotion>[]>(() => [
        {
            key: 'name',
            header: 'Offer Name',
            className: 'p-4',
            cell: (promo) => (
                <div>
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
                </div>
            )
        },
        {
            key: 'value',
            header: 'Type / Value',
            className: 'p-4 font-medium',
            cell: (promo) => (
                <div className="cursor-pointer font-bold font-mono text-slate-950 dark:text-white text-sm" onClick={() => onEdit(promo)}>
                    {promo.promotionType === 'free_shipping' ? (
                        <span className="text-brand-600 dark:text-brand-400 uppercase tracking-widest text-xs">Free Shipping</span>
                    ) : promo.promotionType === 'percentage' ? (
                        `${promo.value}% Off`
                    ) : (
                        `${formatCurrency(promo.value || 0, currency)} Off`
                    )}
                </div>
            )
        },
        {
            key: 'conditions',
            header: 'Conditions',
            className: 'p-4',
            cell: (promo) => (
                <div className="flex flex-col gap-1 text-xs cursor-pointer" onClick={() => onEdit(promo)}>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Targeting: <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{formatTargetType(promo.targetType)}</span>
                    </span>
                    {promo.minOrderValue && promo.minOrderValue > 0 ? (
                        <span className="text-slate-500 font-mono">
                            Min Spend: {formatCurrency(promo.minOrderValue, currency)}
                        </span>
                    ) : null}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            className: 'p-4',
            cell: (promo) => (
                <div className="cursor-pointer" onClick={() => onEdit(promo)}>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${promo.isActive
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shadow-sm'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        {promo.endDate ? `Ends ${new Date(promo.endDate).toLocaleDateString()}` : 'No Expiry'}
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'p-4 text-right',
            cell: (promo) => (
                <button
                    onClick={() => onDelete(promo.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Promotion"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )
        }
    ], [onEdit, onDelete, onCopyOfferLink, copiedId, currency, formatTargetType]);

    const dataTablePagination = useMemo(() => ({
        page: pagination.page,
        total: pagination.total,
        totalPages: pagination.totalPages,
        onPageChange: onPageChange
    }), [pagination, onPageChange]);

    const paginationSummary = useMemo(() => (
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            Showing <span className="font-black text-slate-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-black text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total}</span> promotions
        </p>
    ), [pagination]);

    const getRowKey = useCallback((promo: Promotion) => promo.id, []);

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
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium shadow-sm shadow-brand-500/20"
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

                <DataTable
                    data={promotions}
                    columns={columns}
                    getRowKey={getRowKey}
                    loading={loading && promotions.length === 0}
                    loadingLabel="Loading promotional offers..."
                    emptyLabel={
                        <div className="flex flex-col items-center gap-2 opacity-50 py-8">
                            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">No promotional offers found</p>
                        </div>
                    }
                    pagination={dataTablePagination}
                    paginationSummary={paginationSummary}
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                />
            </div>
        </div>
    );
};

export default memo(PromotionList);
