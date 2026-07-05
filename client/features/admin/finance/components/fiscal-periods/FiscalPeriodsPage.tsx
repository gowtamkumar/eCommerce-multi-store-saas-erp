'use client';

import DataTable from '@/components/shared/DataTable';
import { useMemo } from 'react';
import { useFiscalPeriods } from '../../hooks/useFiscalPeriods';
import FiscalPeriodAuditBanner from './FiscalPeriodAuditBanner';
import FiscalPeriodFormModal from './FiscalPeriodFormModal';
import FiscalPeriodsHeader from './FiscalPeriodsHeader';
import { buildFiscalPeriodColumns } from './fiscalPeriodColumns';

export default function FiscalPeriodsPage() {
    const fiscal = useFiscalPeriods();

    const columns = useMemo(
        () => buildFiscalPeriodColumns(fiscal.togglePeriodStatus),
        [fiscal.togglePeriodStatus],
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <FiscalPeriodsHeader onCreate={fiscal.openCreateModal} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <FiscalPeriodAuditBanner />

                <div className="lg:col-span-2">
                    <DataTable
                        data={fiscal.periods}
                        columns={columns}
                        getRowKey={(period) => period.id}
                        loading={fiscal.loading}
                        emptyLabel="No Fiscal Periods Defined Yet"
                        minWidthClassName="min-w-[600px]"
                        containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
                    />
                </div>
            </div>

            <FiscalPeriodFormModal
                open={fiscal.createOpen}
                formData={fiscal.formData}
                onFieldChange={fiscal.setFormField}
                onClose={fiscal.closeCreateModal}
                onSubmit={fiscal.createPeriod}
            />
        </div>
    );
}
