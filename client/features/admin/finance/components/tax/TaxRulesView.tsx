'use client';

import DataTable, { type DataTableColumn } from '@/components/shared/DataTable';
import type { TaxRule } from '../../types';

export interface TaxRulesViewProps {
    rules: TaxRule[];
    columns: DataTableColumn<TaxRule>[];
    loading: boolean;
}

export default function TaxRulesView({ rules, columns, loading }: TaxRulesViewProps) {
    return (
        <DataTable
            data={rules}
            columns={columns}
            getRowKey={(rule) => rule.id}
            loading={loading}
            emptyLabel="No custom tax rules found."
            minWidthClassName="min-w-[800px]"
            containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
        />
    );
}
