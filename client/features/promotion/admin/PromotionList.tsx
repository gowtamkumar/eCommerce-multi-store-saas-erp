'use client';

import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { Tag } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { Promotion, PromotionListProps } from '../types';
import PromotionSearchBar from './PromotionSearchBar';
import { buildPromotionColumns } from './promotionColumns';

const PromotionList: React.FC<PromotionListProps> = ({
    promotions,
    loading,
    searchQuery,
    onSearchChange,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    onCopyOfferLink,
    copiedId,
}) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    const columns = useMemo(
        () => buildPromotionColumns({ currency, copiedId, onEdit, onDelete, onCopyOfferLink }),
        [currency, copiedId, onEdit, onDelete, onCopyOfferLink],
    );

    const dataTablePagination = useMemo(() => ({
        page: pagination.page,
        total: pagination.total,
        totalPages: pagination.totalPages,
        onPageChange,
    }), [pagination, onPageChange]);

    const paginationSummary = useMemo(() => (
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            Showing <span className="font-black text-slate-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-black text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total}</span> promotions
        </p>
    ), [pagination]);

    const getRowKey = useCallback((promo: Promotion) => promo.id, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative z-0">
            <PromotionSearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} loading={loading} />

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
    );
};

export default memo(PromotionList);
