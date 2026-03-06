'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import dayjs from 'dayjs';
import { Download, X } from 'lucide-react';
import React from 'react';

export default function InvoiceDetailsModal({ invoice, onClose }: any) {
    const { formatPrice } = useSettings();
    const { downloadInvoice } = useDownloadInvoice();

    if (!invoice) return null;

    const order = invoice.order;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                                Invoice {invoice.invoiceNumber}
                            </h2>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Issued on {dayjs(invoice.issueDate).format('MMMM D, YYYY')}
                            {invoice.dueDate && ` • Due on ${dayjs(invoice.dueDate).format('MMMM D, YYYY')}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => downloadInvoice({ ...order, invoiceNumber: invoice.invoiceNumber })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 rounded-xl font-medium transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download PDF</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-8">

                    {/* Customer & Order summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
                            <p className="font-medium text-slate-900 dark:text-white text-lg">{order?.customerName}</p>
                            <div className="text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                                {order?.customerEmail && <p>{order.customerEmail}</p>}
                                {order?.customerPhone && <p>{order.customerPhone}</p>}
                                <p className="mt-2 text-sm">{order?.shippingAddress}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Order Information</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-slate-500">Order ID:</td>
                                        <td className="py-1 text-slate-900 dark:text-white font-medium text-right uppercase">#{invoice.orderId.substring(0, 8)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-slate-500">Order Date:</td>
                                        <td className="py-1 text-slate-900 dark:text-white font-medium text-right">{dayjs(order?.createdAt).format('MMM D, YYYY')}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-slate-500">Payment Method:</td>
                                        <td className="py-1 text-slate-900 dark:text-white font-medium text-right uppercase">{order?.paymentMethod || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-slate-500">Payment Status:</td>
                                        <td className="py-1 text-slate-900 dark:text-white font-medium text-right uppercase">{order?.paymentStatus || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Invoice Items</h3>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Item</th>
                                        <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-center">Qty</th>
                                        <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-right">Price</th>
                                        <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {order?.items?.map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-4">
                                                <p className="font-medium text-slate-900 dark:text-white">{item.product?.name || 'Unknown Product'}</p>
                                                {item.variantId && <p className="text-xs text-slate-500">Variant ID: {item.variantId.substring(0, 8)}</p>}
                                            </td>
                                            <td className="p-4 text-center text-slate-700 dark:text-slate-300">
                                                {item.quantity}
                                            </td>
                                            <td className="p-4 text-right text-slate-700 dark:text-slate-300">
                                                {formatPrice(item.price)}
                                            </td>
                                            <td className="p-4 text-right font-medium text-slate-900 dark:text-white">
                                                {formatPrice(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!order?.items || order.items.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-slate-500">No items found for this order.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatPrice(order?.totalAmount || 0)}</span>
                            </div>

                            {/* Assuming tax and discounts could be here. Falling back to 0 if not explicitly stored */}
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Discount</span>
                                <span className="font-medium">{formatPrice(0)}</span>
                            </div>

                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Tax</span>
                                <span className="font-medium">{formatPrice(0)}</span>
                            </div>

                            <div className="pt-3 flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                                <span>Total Amount</span>
                                <span className="text-brand-600 dark:text-brand-400">{formatPrice(order?.totalAmount || 0)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
