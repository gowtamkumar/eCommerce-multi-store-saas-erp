'use client';

import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { Tag } from 'lucide-react';
import { useMemo } from 'react';
import type { Coupon, CouponListProps } from '../types';
import { buildCouponColumns } from './couponColumns';

export default function CouponList({
    coupons,
    loading,
    onEdit,
    onDelete,
    pagination,
    onPageChange,
}: CouponListProps) {
    const { formatPrice } = useSettings();

    const columns = useMemo(
        () => buildCouponColumns({ onEdit, onDelete, formatPrice }),
        [onEdit, onDelete, formatPrice],
    );

    return (
        <DataTable
            data={coupons}
            columns={columns}
            getRowKey={(coupon: Coupon) => coupon.id}
            loading={loading && !coupons.length}
            loadingLabel="Loading coupons..."
            emptyLabel={
                <div>
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                        <Tag className="w-8 h-8 text-slate-300" strokeWidth={1} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No matching coupons found</p>
                </div>
            }
            containerClassName="rounded-3xl min-h-[400px]"
            pagination={{
                page: pagination.page,
                total: pagination.total,
                totalPages: pagination.totalPages,
                onPageChange,
            }}
            paginationSummary={
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Index <span className="text-slate-900 dark:text-white px-1">{pagination.page}</span> of <span className="text-slate-900 dark:text-white px-1">{pagination.totalPages}</span>
                    <span className="ml-2 text-slate-400 font-bold">({pagination.total} ENTITIES)</span>
                </p>
            }
        />
    );
}
