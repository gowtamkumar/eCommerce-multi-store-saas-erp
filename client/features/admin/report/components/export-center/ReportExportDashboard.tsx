'use client';

import { fetchAPI } from '@/services/api';
import { FileText, LayoutDashboard, Users, Wallet } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ReportExportType, useReportExport } from '../../hooks/useReportExport';
import ReportExportHeader from './ReportExportHeader';
import ReportExportSettings from './ReportExportSettings';
import ReportTypeSelection from './ReportTypeSelection';

const ReportExportDashboard: React.FC = () => {
    const [reportType, setReportType] = useState<ReportExportType>('sales');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const { exportReport, isExporting } = useReportExport();

    const reports = useMemo(() => [
        { id: 'sales', name: 'Sales Report', description: 'Detailed log of successful customer payments', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
        { id: 'expenses', name: 'Expenses Log', description: 'Complete list of recorded operating expenses', icon: FileText, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        { id: 'cash-flow', name: 'Cash Flow Summary', description: 'Transaction-level unified money movement', icon: Wallet, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        { id: 'supplier-ledger', name: 'Supplier Ledger', description: 'Chronological history of vendor transactions', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
        { id: 'customer-ledger', name: 'Customer Ledger', description: 'Chronological history of customer transactions', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    ], []);

    useEffect(() => {
        if (reportType === 'supplier-ledger') {
            const loadSuppliers = async () => {
                try {
                    const res = await fetchAPI('/suppliers');
                    setSuppliers(res.data?.items || []);
                } catch (error) {
                    toast.error('Failed to load suppliers');
                }
            };
            loadSuppliers();
        } else if (reportType === 'customer-ledger') {
            const loadCustomers = async () => {
                try {
                    const res = await fetchAPI('/customer');
                    setCustomers(res.data?.items || []);
                } catch (error) {
                    toast.error('Failed to load customers');
                }
            };
            loadCustomers();
        }
    }, [reportType]);

    const handleExport = useCallback(() => {
        void exportReport({
            type: reportType,
            startDate,
            endDate,
            supplierId: selectedSupplierId || undefined,
            customerId: selectedCustomerId || undefined,
        });
    }, [exportReport, reportType, startDate, endDate, selectedSupplierId, selectedCustomerId]);

    const handleTypeChange = useCallback((type: string) => {
        setReportType(type as ReportExportType);
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            <ReportExportHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                    <ReportExportSettings
                        reportType={reportType}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        suppliers={suppliers}
                        selectedSupplierId={selectedSupplierId}
                        onSupplierChange={setSelectedSupplierId}
                        customers={customers}
                        selectedCustomerId={selectedCustomerId}
                        onCustomerChange={setSelectedCustomerId}
                        onExport={handleExport}
                        isLoading={isExporting}
                    />
                </div>

                <div className="lg:col-span-5">
                    <ReportTypeSelection
                        reports={reports}
                        currentType={reportType}
                        onTypeChange={handleTypeChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(ReportExportDashboard);
