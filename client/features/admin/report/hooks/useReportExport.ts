'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export type ReportExportType =
    | 'sales'
    | 'expenses'
    | 'cash-flow'
    | 'supplier-ledger'
    | 'customer-ledger';

export interface ReportExportOptions {
    type: ReportExportType;
    startDate?: string;
    endDate?: string;
    supplierId?: string;
    customerId?: string;
}

interface ExportResponse {
    success: boolean;
    message?: string;
    data?: {
        csv: string;
        filename: string;
    };
}

const triggerCsvDownload = (csv: string, filename: string) => {
    if (typeof window === 'undefined') return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
};

const buildExportUrl = ({ type, startDate, endDate, supplierId, customerId }: ReportExportOptions) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (type === 'supplier-ledger' && supplierId) params.set('supplierId', supplierId);
    if (type === 'customer-ledger' && customerId) params.set('customerId', customerId);

    const qs = params.toString();
    return qs ? `/report/export/${type}?${qs}` : `/report/export/${type}`;
};

export function useReportExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportReport = useCallback(async (options: ReportExportOptions): Promise<boolean> => {
        if (options.type === 'supplier-ledger' && !options.supplierId) {
            toast.error('Select a supplier before exporting');
            return false;
        }
        if (options.type === 'customer-ledger' && !options.customerId) {
            toast.error('Select a customer before exporting');
            return false;
        }

        try {
            setIsExporting(true);
            const res: ExportResponse = await fetchAPI(buildExportUrl(options));

            if (res?.success && res.data?.csv) {
                triggerCsvDownload(res.data.csv, res.data.filename);
                toast.success('Report exported');
                return true;
            }

            toast.error(res?.message || 'Export failed');
            return false;
        } catch (error) {
            console.error('Report export failed', error);
            toast.error('Export failed. Please try again.');
            return false;
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { exportReport, isExporting };
}
