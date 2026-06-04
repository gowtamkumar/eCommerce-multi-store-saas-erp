'use client';

import { Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { useProfitLoss } from '../../hooks/useProfitLoss';
import IncomeStatement from './IncomeStatement';
import ProfitLossFilters from './ProfitLossFilters';
import ProfitLossHeader from './ProfitLossHeader';
import ProfitLossKpiCards from './ProfitLossKpiCards';

export function ProfitLossPage() {
    const { formatPrice } = useSettings();
    const {
        data,
        loading,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        expandRevenue,
        setExpandRevenue,
        expandCogs,
        setExpandCogs,
        expandExpenses,
        setExpandExpenses,
        load,
        setPresetRange,
        grossMargin,
        netMargin,
        isProfitable,
    } = useProfitLoss();

    return (
        <div className="space-y-6 pb-12">
            <ProfitLossHeader onRefresh={load} />

            <ProfitLossFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPresetRange={setPresetRange}
            />

            {loading ? (
                <div className="flex items-center justify-center py-24 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            ) : (
                <>
                    <ProfitLossKpiCards
                        data={data}
                        grossMargin={grossMargin}
                        netMargin={netMargin}
                        isProfitable={isProfitable}
                        formatPrice={formatPrice}
                    />

                    <IncomeStatement
                        data={data}
                        expandRevenue={expandRevenue}
                        onToggleRevenue={() => setExpandRevenue(!expandRevenue)}
                        expandCogs={expandCogs}
                        onToggleCogs={() => setExpandCogs(!expandCogs)}
                        expandExpenses={expandExpenses}
                        onToggleExpenses={() => setExpandExpenses(!expandExpenses)}
                        netMargin={netMargin}
                        isProfitable={isProfitable}
                        formatPrice={formatPrice}
                    />
                </>
            )}
        </div>
    );
}
