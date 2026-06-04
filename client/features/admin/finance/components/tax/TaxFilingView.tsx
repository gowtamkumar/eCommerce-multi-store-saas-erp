'use client';

import { Download, Loader2 } from 'lucide-react';
import DataTable, { type DataTableColumn } from '@/components/shared/DataTable';
import type { TaxFilingData, TaxFilingLog } from '../../types';
import TaxFilingFilters from './TaxFilingFilters';
import TaxFilingSummaryCards from './TaxFilingSummaryCards';

type PriceFormatter = (amount: number) => string;

export interface TaxFilingViewProps {
    filing: TaxFilingData | null;
    loading: boolean;
    startDate: string;
    endDate: string;
    columns: DataTableColumn<TaxFilingLog>[];
    formatPrice: PriceFormatter;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onExport: () => void;
}

export default function TaxFilingView({
    filing,
    loading,
    startDate,
    endDate,
    columns,
    formatPrice,
    onStartDateChange,
    onEndDateChange,
    onExport,
}: TaxFilingViewProps) {
    return (
        <div className="space-y-6">
            <TaxFilingFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <>
                    <TaxFilingSummaryCards filing={filing} formatPrice={formatPrice} />

                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Filing Audit Trail Vouchers</h3>
                            <button
                                onClick={onExport}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" /> Export Filing Report
                            </button>
                        </div>
                        <DataTable
                            data={filing?.transactionLogs || []}
                            columns={columns}
                            getRowKey={(log) => `${log.voucherId}-${log.date}`}
                            loading={loading}
                            emptyLabel="No taxable general ledger postings located for this period."
                            minWidthClassName="min-w-[800px]"
                            containerClassName="!bg-transparent !shadow-none !border-none !rounded-none !p-0"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
