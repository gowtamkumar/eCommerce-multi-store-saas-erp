'use client';

import { useMemo } from 'react';
import { Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import type { UnpaidInvoice } from '../../types';
import { buildApInvoiceColumns } from './apInvoiceColumns';

export interface BatchInvoiceListProps {
    filteredInvoices: UnpaidInvoice[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    selectedInvoiceIds: string[];
    hasInvoices: boolean;
    allSelected: boolean;
    onToggleInvoice: (id: string) => void;
    onToggleSelectAll: () => void;
}

export default function BatchInvoiceList({
    filteredInvoices,
    loading,
    search,
    onSearchChange,
    selectedInvoiceIds,
    hasInvoices,
    allSelected,
    onToggleInvoice,
    onToggleSelectAll,
}: BatchInvoiceListProps) {
    const { formatPrice } = useSettings();
    const columns = useMemo(
        () => buildApInvoiceColumns(selectedInvoiceIds, formatPrice),
        [selectedInvoiceIds, formatPrice],
    );

    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search invoice or vendor..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                    />
                </div>
                {hasInvoices && (
                    <button
                        onClick={onToggleSelectAll}
                        className="text-brand-600 hover:text-brand-700 text-xs font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        {allSelected ? 'Deselect All' : 'Select All Invoices'}
                    </button>
                )}
            </div>

            <DataTable
                data={filteredInvoices}
                columns={columns}
                getRowKey={(inv) => inv.id}
                loading={loading}
                emptyLabel="No outstanding invoices to pay."
                onRowClick={(inv) => onToggleInvoice(inv.id)}
                rowClassName={(inv) => (selectedInvoiceIds.includes(inv.id) ? 'bg-brand-50/30 dark:bg-brand-950/10' : '')}
                minWidthClassName="min-w-[700px]"
                containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />
        </div>
    );
}
