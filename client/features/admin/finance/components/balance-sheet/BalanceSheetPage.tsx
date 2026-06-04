'use client';

import { Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { useBalanceSheet } from '../../hooks/useBalanceSheet';
import AccountingEquationBanner from './AccountingEquationBanner';
import { BALANCE_SHEET_SECTIONS } from './balanceSheetSections';
import BalanceSheetHeader from './BalanceSheetHeader';
import BalanceSheetSectionCard from './BalanceSheetSectionCard';

export function BalanceSheetPage() {
    const { formatPrice } = useSettings();
    const { data, loading, load, isBalanced } = useBalanceSheet();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <BalanceSheetHeader showStatus={!!data} isBalanced={isBalanced} onRefresh={load} />

            <AccountingEquationBanner
                totalAssets={data?.totalAssets || 0}
                totalLiabilities={data?.totalLiabilities || 0}
                totalEquity={data?.totalEquity || 0}
                formatPrice={formatPrice}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {BALANCE_SHEET_SECTIONS.map((section, index) => (
                    <BalanceSheetSectionCard
                        key={section.key}
                        section={section}
                        items={data?.[section.key] || []}
                        total={data?.[section.totalKey] || 0}
                        index={index}
                        formatPrice={formatPrice}
                    />
                ))}
            </div>
        </div>
    );
}
