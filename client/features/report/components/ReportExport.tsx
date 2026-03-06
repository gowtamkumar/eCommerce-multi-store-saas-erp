'use client';

import { fetchAPI } from '@/services/api';
import { Download, FileDown, FileSpreadsheet, FileText, Filter, LayoutDashboard, Search, Users, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ReportExport() {
    const [isLoading, setIsLoading] = useState(false);
    const [reportType, setReportType] = useState('sales');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');

    useEffect(() => {
        if (reportType === 'supplier-ledger') {
            const loadSuppliers = async () => {
                try {
                    const res = await fetchAPI('/suppliers');
                    setSuppliers(res.data || []);
                } catch (error) {
                    toast.error('Failed to load suppliers');
                }
            };
            loadSuppliers();
        }
    }, [reportType]);

    const handleExport = async () => {
        try {
            setIsLoading(true);
            let url = `/report/export/${reportType}?startDate=${startDate}&endDate=${endDate}`;
            if (reportType === 'supplier-ledger' && selectedSupplierId) {
                url += `&supplierId=${selectedSupplierId}`;
            }

            const res = await fetchAPI(url);

            if (res.success && res.data) {
                const { csv, filename } = res.data;
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Report exported successfully');
                }
            } else {
                toast.error(res.message || 'Export failed');
            }
        } catch (error) {
            toast.error('Export failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const reports = [
        { id: 'sales', name: 'Sales Report', description: 'Detailed log of successful customer payments', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50' },
        { id: 'expenses', name: 'Expenses Log', description: 'Complete list of recorded operating expenses', icon: FileText, color: 'text-amber-600 bg-amber-50' },
        { id: 'cash-flow', name: 'Cash Flow Summary', description: 'Transaction-level unified money movement', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
        { id: 'supplier-ledger', name: 'Supplier Ledger', description: 'Chronological history of vendor transactions', icon: Users, color: 'text-blue-600 bg-blue-50' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileDown className="w-8 h-8 text-brand-600" />
                </div>
                <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white">Export Financial Data</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">Generate and download CSV reports compatible with Excel and Quickbooks for your accounting needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Report Settings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            {reportType === 'supplier-ledger' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Supplier</label>
                                    <select
                                        value={selectedSupplierId}
                                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
                                    >
                                        <option value="">Choose a Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Format</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">CSV (Comma Separated Values)</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Standard format for spreadsheets</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isLoading || (reportType === 'supplier-ledger' && !selectedSupplierId)}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:dark:bg-slate-700 text-white rounded-2xl font-black font-display shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                DOWNLOAD REPORT
                            </>
                        )}
                    </button>
                </div>

                {/* Report Type Selection */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Available Reports</h3>
                    {reports.map((report) => (
                        <button
                            key={report.id}
                            onClick={() => setReportType(report.id)}
                            className={`w-full text-left p-4 rounded-3xl border-2 transition-all flex items-center gap-4 group ${reportType === report.id
                                    ? 'bg-white dark:bg-slate-800 border-brand-600 shadow-md transform scale-[1.02]'
                                    : 'bg-transparent border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${reportType === report.id ? report.color : 'bg-slate-100 dark:bg-slate-800 grayscale opacity-50'
                                }`}>
                                <report.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className={`text-sm font-black ${reportType === report.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{report.name}</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">{report.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
