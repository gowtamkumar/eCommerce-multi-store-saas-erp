import { Activity, Briefcase, Layers, type LucideIcon } from 'lucide-react';
import type { CashFlowSegmentKey } from '../../types';

export interface CashFlowActivityConfig {
    key: CashFlowSegmentKey;
    title: string;
    icon: LucideIcon;
    inflowLabel: string;
    outflowLabel: string;
    netLabel: string;
}

export const CASH_FLOW_ACTIVITIES: CashFlowActivityConfig[] = [
    {
        key: 'operating',
        title: 'Operating Activities',
        icon: Activity,
        inflowLabel: 'Cash Receipts (Sales & AR)',
        outflowLabel: 'Cash Paid (Suppliers & Operating)',
        netLabel: 'Net Operating Cash',
    },
    {
        key: 'investing',
        title: 'Investing Activities',
        icon: Briefcase,
        inflowLabel: 'Sale of Fixed Assets',
        outflowLabel: 'Acquisition of Assets',
        netLabel: 'Net Investing Cash',
    },
    {
        key: 'financing',
        title: 'Financing Activities',
        icon: Layers,
        inflowLabel: 'Capital Injection / Loans',
        outflowLabel: 'Loan Repayments / Dividends',
        netLabel: 'Net Financing Cash',
    },
];
