'use client';

import { useSettings } from '@/hooks/SettingsContext';
import React, { useMemo } from 'react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { PurchaseOrderStatus } from '@/lib/enums/purchase-order.type.enum';
import {
    ArrowLeft, Calendar, CreditCard, FileText,
    History, Landmark, Package, Plus, Truck,
} from 'lucide-react';
import Link from 'next/link';
import { getPaymentStatusBadge, getStatusBadge } from './comonfun';
import { usePurchaseOrderDetails } from '../hooks/usePurchaseOrderDetails';
import ReceiveProductsModal from './ReceiveProductsModal';
import RecordPaymentModal from './RecordPaymentModal';

export default function PurchaseOrderDetails() {
    const { formatPrice } = useSettings();
    const {
        order,
        loading,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isReceiveModalOpen,
        setIsReceiveModalOpen,
        warehouses,
        branches,
        balance,
        openReceiveModal,
        handleReceive,
        handleRecordPayment,
    } = usePurchaseOrderDetails();

    const columns = useMemo<DataTableColumn<any>[]>(() => [
        {
            key: 'product',
            header: 'Product',
            cell: (item) => (
                <>
                    <div className="font-black text-slate-900 dark:text-white text-base group-hover:text-brand-600 transition-colors">
                        {item.product?.name || 'Unknown Product'}
                    </div>
                    {item.variant && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(item.variant.combination || {}).map(([k, v]: [string, any]) => (
                                <span key={k} className="text-[10px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                    {k}: {v}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono mt-2 bg-slate-50 dark:bg-slate-900/50 w-fit px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                        SKU: {item.variant?.sku || item.product?.slug}
                    </div>
                </>
            ),
        },
        {
            key: 'quantity',
            header: 'Quantity',
            className: 'text-center font-black text-slate-600 dark:text-slate-300 text-lg',
            cell: (item) => item.quantity,
        },
        {
            key: 'unitPrice',
            header: 'Unit Price',
            className: 'text-right font-mono text-slate-500 dark:text-slate-400 font-bold',
            cell: (item) => formatPrice(Number(item.unitPrice) || 0),
        },
        {
            key: 'subtotal',
            header: 'Subtotal',
            className: 'text-right font-black text-slate-900 dark:text-white font-mono text-lg',
            cell: (item) => formatPrice(Number(item.quantity || 0) * Number(item.unitPrice || 0)),
        },
    ], [formatPrice]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order not found</h2>
                <Link href="/admin/procurement/purchases" className="text-brand-600 hover:underline mt-4 inline-block">
                    Back to purchases
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/procurement/purchases"
                        className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-400 hover:text-brand-600 rounded-2xl transition-all duration-300"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{order.referenceNumber}</h1>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-2 font-medium">
                            <Calendar className="w-4 h-4 text-brand-500" />
                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {order.status !== PurchaseOrderStatus.RECEIVED && order.status !== PurchaseOrderStatus.CANCELLED && (
                        <button
                            onClick={openReceiveModal}
                            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 flex items-center gap-3"
                        >
                            <Package className="w-6 h-6" />
                            Receive Products
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column – 3/4 */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Items Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Package className="w-6 h-6 text-brand-500" /> Order Inventory
                            </h3>
                            <span className="bg-slate-100 dark:bg-slate-900 px-4 py-1.5 rounded-full text-xs font-bold text-slate-500">
                                {order.items?.length || 0} Items
                            </span>
                        </div>
                        <DataTable
                            data={order.items || []}
                            columns={columns}
                            getRowKey={(item) => item.id}
                            loading={false}
                            emptyLabel="No items in this order"
                            containerClassName="shadow-none border-none rounded-none"
                            minWidthClassName="min-w-[600px]"
                        />
                        <div className="p-10 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex flex-col md:flex-row justify-end items-end gap-12">
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount Payable</p>
                                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">
                                        {formatPrice(Number(order.totalAmount) || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary & Payments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <Landmark className="w-6 h-6 text-brand-500" /> Account Summary
                                </h3>
                                {getPaymentStatusBadge(order.paymentStatus)}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Already Paid</p>
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                        {formatPrice(Number(order.paidAmount) || 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
                                    <p className={`text-2xl font-black font-mono ${balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                                        {formatPrice(balance)}
                                    </p>
                                </div>
                            </div>
                            {balance > 0 && order.status !== PurchaseOrderStatus.CANCELLED && (
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="w-full py-4 bg-slate-900 dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Plus className="w-6 h-6" />
                                    Record New Payment
                                </button>
                            )}
                        </div>

                        {/* Payment History */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 space-y-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <History className="w-6 h-6 text-brand-500" /> Payment Log
                            </h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {order.payments?.length > 0 ? (
                                    order.payments.map((payment: any) => (
                                        <div key={payment.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 space-y-2 group">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-slate-900 dark:text-white font-mono">
                                                    {formatPrice(Number(payment.amount) || 0)}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <CreditCard className="w-3 h-3 text-brand-500" />
                                                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                    {payment.paymentMethod}
                                                </span>
                                            </div>
                                            {payment.transactionId && (
                                                <div className="text-[10px] text-slate-400 font-mono truncate bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                    ID: {payment.transactionId}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center space-y-3">
                                        <CreditCard className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
                                        <p className="text-sm text-slate-400 font-bold italic">No payments recorded yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column – Supplier & Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 space-y-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 pb-6">
                            <Truck className="w-6 h-6 text-brand-500" /> Supplier Profile
                        </h3>
                        <div className="space-y-6">
                            <div className="group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Company Entity</p>
                                <p className="text-slate-900 dark:text-white font-black text-lg group-hover:text-brand-600 transition-colors">
                                    {order.supplier?.name}
                                </p>
                            </div>
                            {order.supplier?.contactName && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact Personal</p>
                                    <p className="text-slate-900 dark:text-white font-bold">{order.supplier.contactName}</p>
                                </div>
                            )}
                            {order.supplier?.email && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Direct Email</p>
                                    <p className="text-brand-600 dark:text-brand-400 font-bold underline decoration-brand-200 underline-offset-4">
                                        {order.supplier.email}
                                    </p>
                                </div>
                            )}
                            {order.supplier?.phone && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Voice Line</p>
                                    <p className="text-slate-900 dark:text-white font-bold">{order.supplier.phone}</p>
                                </div>
                            )}
                            {order.supplier?.address && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Postal Address</p>
                                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-relaxed">{order.supplier.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 text-slate-400 rounded-3xl p-8 space-y-6">
                        <h4 className="font-black text-white flex items-center gap-3">
                            <FileText className="w-5 h-5 text-brand-400" /> Ledger Note
                        </h4>
                        <p className="text-xs font-medium italic opacity-60 leading-relaxed">
                            System-generated audit: This purchase order represents a significant inventory intake.
                            Ensure all items are physically verified against the packing list upon arrival.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isReceiveModalOpen && (
                <ReceiveProductsModal
                    order={order}
                    warehouses={warehouses}
                    branches={branches}
                    onClose={() => setIsReceiveModalOpen(false)}
                    onConfirm={handleReceive}
                />
            )}

            {isPaymentModalOpen && (
                <RecordPaymentModal
                    balance={balance}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleRecordPayment}
                />
            )}
        </div>
    );
}
