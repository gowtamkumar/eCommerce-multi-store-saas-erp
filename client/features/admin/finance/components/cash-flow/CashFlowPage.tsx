'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useCashFlow } from '../../hooks/useCashFlow';
import CashFlowActivityCard from './CashFlowActivityCard';
import CashFlowBalanceCards from './CashFlowBalanceCards';
import CashFlowHeader from './CashFlowHeader';
import { CASH_FLOW_ACTIVITIES } from './cashFlowActivities';

export default function CashFlowPage() {
    const { formatPrice } = useSettings();
    const { report, loading } = useCashFlow();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">
                Failed to load statement
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <CashFlowHeader />

            <CashFlowBalanceCards
                startingBalance={report.startingBalance}
                netChange={report.netChange}
                endingBalance={report.endingBalance}
                formatPrice={formatPrice}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {CASH_FLOW_ACTIVITIES.map((config) => (
                    <CashFlowActivityCard
                        key={config.key}
                        config={config}
                        segment={report[config.key]}
                        formatPrice={formatPrice}
                    />
                ))}
            </div>
        </div>
    );
}
