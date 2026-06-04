import { DollarSign, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { BalanceSheetSectionKey, BalanceSheetTotalKey } from '../../types';

export interface BalanceSheetSection {
    key: BalanceSheetSectionKey;
    totalKey: BalanceSheetTotalKey;
    title: string;
    icon: LucideIcon;
    color: string;
    desc: string;
}

export const BALANCE_SHEET_SECTIONS: BalanceSheetSection[] = [
    { key: 'assets', totalKey: 'totalAssets', title: 'Assets', icon: TrendingUp, color: 'emerald', desc: 'Everything the business owns' },
    { key: 'liabilities', totalKey: 'totalLiabilities', title: 'Liabilities', icon: TrendingDown, color: 'rose', desc: 'Everything the business owes' },
    { key: 'equity', totalKey: 'totalEquity', title: 'Equity', icon: DollarSign, color: 'violet', desc: "Owner's stake in the business" },
];
