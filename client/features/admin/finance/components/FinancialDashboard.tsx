'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { useFinancialDashboard } from '../hooks/useFinancialDashboard';
import BalanceOverview from './dashboard/BalanceOverview';
import FinancialDashboardHeader from './dashboard/FinancialDashboardHeader';
import FinancialViewTabs from './dashboard/FinancialViewTabs';
import IncomeStatementBreakdown from './dashboard/IncomeStatementBreakdown';
import PLKpiCards from './dashboard/PLKpiCards';

export function FinancialDashboard() {
    const { formatPrice } = useSettings();
    const {
        plData,
        bsData,
        loading,
        activeView,
        setActiveView,
        initializing,
        fetchData,
        handleInit,
        grossMargin,
        netMargin,
        isProfitable,
    } = useFinancialDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <FinancialDashboardHeader
                initializing={initializing}
                onInitialize={handleInit}
                onRefresh={fetchData}
            />

            <FinancialViewTabs activeView={activeView} onViewChange={setActiveView} />

            <AnimatePresence mode="wait">
                {activeView === 'overview' ? (
                    <motion.div key="pl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <PLKpiCards
                            plData={plData}
                            grossMargin={grossMargin}
                            netMargin={netMargin}
                            isProfitable={isProfitable}
                            formatPrice={formatPrice}
                        />
                        <IncomeStatementBreakdown plData={plData} isProfitable={isProfitable} formatPrice={formatPrice} />
                    </motion.div>
                ) : (
                    <motion.div key="bs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <BalanceOverview bsData={bsData} formatPrice={formatPrice} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
