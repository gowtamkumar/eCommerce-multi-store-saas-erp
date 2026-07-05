'use client';

import DataTable from '@/components/shared/DataTable';
import { useMemo } from 'react';
import type { DunningLog } from '../../types';
import { buildDunningLogColumns } from './dunningLogColumns';

export interface DunningLogsViewProps {
    logs: DunningLog[];
    loading: boolean;
    onViewDetails: (log: DunningLog) => void;
}

export default function DunningLogsView({ logs, loading, onViewDetails }: DunningLogsViewProps) {
    const columns = useMemo(() => buildDunningLogColumns(onViewDetails), [onViewDetails]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dunning Notice Logs</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Audit trail of sent notices and auto-hold enforcement events</p>
            </div>

            <DataTable
                data={logs}
                columns={columns}
                getRowKey={(log) => log.id}
                loading={loading}
                emptyLabel="No dunning events recorded yet."
                minWidthClassName="min-w-[1000px]"
                containerClassName="rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />
        </div>
    );
}
