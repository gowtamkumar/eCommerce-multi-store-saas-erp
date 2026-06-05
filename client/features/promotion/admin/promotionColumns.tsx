'use client';

import type { DataTableColumn } from '@/components/shared/DataTable';
import { PromotionType } from '@/lib/enums/promotion-type.enum';
import { formatCurrency } from '@/lib/utils';
import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
import type { Promotion } from '../types';

export interface BuildPromotionColumnsOptions {
    currency: string;
    copiedId: string | null;
    onEdit: (promotion: Promotion) => void;
    onDelete: (id: string) => void;
    onCopyOfferLink: (slug: string, id: string) => void;
}

function formatTargetType(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildPromotionColumns({
    currency,
    copiedId,
    onEdit,
    onDelete,
    onCopyOfferLink,
}: BuildPromotionColumnsOptions): DataTableColumn<Promotion>[] {
    return [
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
            ),
        },
        {
            key: 'value',
            header: 'Type / Value',
            className: 'p-4 font-medium',
            cell: (promo) => (
                <div className="cursor-pointer font-bold font-mono text-slate-950 dark:text-white text-sm" onClick={() => onEdit(promo)}>
                    {promo.promotionType === PromotionType.FREE_SHIPPING ? (
                        <span className="text-brand-600 dark:text-brand-400 uppercase tracking-widest text-xs">Free Shipping</span>
                    ) : promo.promotionType === PromotionType.PERCENTAGE ? (
                        `${promo.value}% Off`
                    ) : (
                        `${formatCurrency(promo.value || 0, currency)} Off`
                    )}
                </div>
            ),
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
            ),
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
            ),
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
            ),
        },
    ];
}
