import { FileText, LayoutDashboard, Users, Wallet } from 'lucide-react';
import type { ReportExportType } from '../hooks/useReportExport';
import type { ReportTypeOption } from '../types';

export interface ReportExportTypeOption extends ReportTypeOption {
    id: ReportExportType;
}

export const REPORT_EXPORT_OPTIONS: ReportExportTypeOption[] = [
    {
        id: 'sales',
        name: 'Sales Report',
        description: 'Detailed log of successful customer payments',
        icon: LayoutDashboard,
        color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20',
    },
    {
        id: 'expenses',
        name: 'Expenses Log',
        description: 'Complete list of recorded operating expenses',
        icon: FileText,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    },
    {
        id: 'cash-flow',
        name: 'Cash Flow Summary',
        description: 'Transaction-level unified money movement',
        icon: Wallet,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
        id: 'supplier-ledger',
        name: 'Supplier Ledger',
        description: 'Chronological history of vendor transactions',
        icon: Users,
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    },
    {
        id: 'customer-ledger',
        name: 'Customer Ledger',
        description: 'Chronological history of customer transactions',
        icon: Users,
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    },
];
