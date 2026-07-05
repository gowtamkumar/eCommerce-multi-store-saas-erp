'use client';

import React from 'react';
import { useReportExportCenter } from '../../hooks/useReportExportCenter';
import { REPORT_EXPORT_OPTIONS } from '../../lib/reportExportOptions';
import ReportExportHeader from './ReportExportHeader';
import ReportExportSettings from './ReportExportSettings';
import ReportTypeSelection from './ReportTypeSelection';

const ReportExportDashboard: React.FC = () => {
    const {
        reportType,
        startDate,
        endDate,
        suppliers,
        selectedSupplierId,
        customers,
        selectedCustomerId,
        isExporting,
        setStartDate,
        setEndDate,
        setSelectedSupplierId,
        setSelectedCustomerId,
        handleExport,
        handleTypeChange,
    } = useReportExportCenter();

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
                        reports={REPORT_EXPORT_OPTIONS}
                        currentType={reportType}
                        onTypeChange={handleTypeChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(ReportExportDashboard);
