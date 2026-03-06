'use client';

import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { Download, Eye, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import { fetchAPI } from '@/services/api';

export default function InvoicesList() {
    const { formatPrice } = useSettings();
    const { downloadInvoice } = useDownloadInvoice();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await fetchAPI('/invoices');
            setInvoices(data.data);
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'OVERDUE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'CANCELLED': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-brand-600" />
                        Invoices
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage customer invoices</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="p-4 font-medium">Invoice Number</th>
                                <th className="p-4 font-medium">Order ID</th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Issue Date</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">Loading invoices...</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">No invoices generated yet</td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {invoice.invoiceNumber}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            #{invoice.orderId?.slice(-6).toUpperCase() || 'N/A'}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {invoice.order?.customerName || 'N/A'}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {dayjs(invoice.issueDate).format('MMM D, YYYY')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">
                                            {formatPrice(invoice.order?.totalAmount || 0)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => downloadInvoice({
                                                        ...invoice.order,
                                                        invoiceNumber: invoice.invoiceNumber
                                                    })}
                                                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
