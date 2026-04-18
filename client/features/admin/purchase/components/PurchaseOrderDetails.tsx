'use client';
import { useSettings } from '@/hooks/SettingsContext';
import { PurchaseOrderStatus } from '@/lib/enums/purchase-order.type.enum';
import { fetchAPI } from '@/services/api';
import { ArrowLeft, Calendar, CheckCircle, CreditCard, FileText, History, Landmark, Package, Plus, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPaymentStatusBadge, getStatusBadge } from './comonfun';

export default function PurchaseOrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { formatPrice } = useSettings();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMethod: 'Bank Transfer',
        note: '',
        transactionId: ''
    });

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetchAPI(`/purchase-orders/${id}`);
            setOrder(res.data || res);
        } catch (error) {
            console.error('Failed to fetch purchase order', error);
            toast.error('Failed to load purchase order details');
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async () => {
        const toastId = toast.loading('Receiving order and updating stock...');
        try {
            await fetchAPI(`/purchase-orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: PurchaseOrderStatus.RECEIVED })
            });
            toast.success('Order received! Inventory updated.', { id: toastId });
            fetchOrder();
        } catch (error) {
            toast.error('Failed to receive order', { id: toastId });
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Recording payment...');
        try {
            await fetchAPI(`/purchase-orders/${id}/payments`, {
                method: 'POST',
                body: JSON.stringify({
                    ...paymentForm,
                    amount: Number(paymentForm.amount)
                })
            });
            toast.success('Payment recorded successfully!', { id: toastId });
            setIsPaymentModalOpen(false);
            setPaymentForm({ amount: '', paymentMethod: 'Bank Transfer', note: '', transactionId: '' });
            fetchOrder();
        } catch (error) {
            toast.error('Failed to record payment', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order not found</h2>
                <Link href="/admin/purchases" className="text-brand-600 hover:underline mt-4 inline-block">Back to purchases</Link>
            </div>
        );
    }

    const balance = order.totalAmount - (order.paidAmount || 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-6">
                    <Link href="/admin/purchases" className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-400 hover:text-brand-600 rounded-2xl transition-all duration-300">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{order.referenceNumber}</h1>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-2 font-medium">
                            <Calendar className="w-4 h-4 text-brand-500" /> {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {order.status !== PurchaseOrderStatus.RECEIVED && order.status !== PurchaseOrderStatus.CANCELLED && (
                        <button
                            onClick={handleReceive}
                            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 flex items-center gap-3"
                        >
                            <Package className="w-6 h-6" />
                            Receive Products
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column - 3/4 */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Items Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Package className="w-6 h-6 text-brand-500" /> Order Inventory
                            </h3>
                            <span className="bg-slate-100 dark:bg-slate-900 px-4 py-1.5 rounded-full text-xs font-bold text-slate-500">{order.items?.length || 0} Items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Product</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {order.items?.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-slate-900 dark:text-white text-base group-hover:text-brand-600 transition-colors">{item.product?.name || 'Unknown Product'}</div>
                                                {item.variant && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {Object.entries(item.variant.combination || {}).map(([k, v]: [string, any]) => (
                                                            <span key={k} className="text-[10px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                                                {k}: {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-slate-400 font-mono mt-2 bg-slate-50 dark:bg-slate-900/50 w-fit px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">SKU: {item.variant?.sku || item.product?.slug}</div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-slate-600 dark:text-slate-300 text-lg">
                                                {item.quantity}
                                            </td>
                                            <td className="px-8 py-6 text-right font-mono text-slate-500 dark:text-slate-400 font-bold">
                                                {formatPrice(item.unitPrice)}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white font-mono text-lg">
                                                {formatPrice(item.quantity * item.unitPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-10 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex flex-col md:flex-row justify-end items-end gap-12">
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount Payable</p>
                                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">{formatPrice(order.totalAmount)}</p>
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
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatPrice(order.paidAmount || 0)}</p>
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
                                                <span className="font-black text-slate-900 dark:text-white font-mono">{formatPrice(payment.amount)}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <CreditCard className="w-3 h-3 text-brand-500" />
                                                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{payment.paymentMethod}</span>
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

                {/* Right Column - Supplier & Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 space-y-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 pb-6">
                            <Truck className="w-6 h-6 text-brand-500" /> Supplier Profile
                        </h3>
                        <div className="space-y-6">
                            <div className="group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Company Entity</p>
                                <p className="text-slate-900 dark:text-white font-black text-lg group-hover:text-brand-600 transition-colors">{order.supplier?.name}</p>
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
                                    <p className="text-brand-600 dark:text-brand-400 font-bold underline decoration-brand-200 underline-offset-4">{order.supplier.email}</p>
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
                        <p className="text-xs font-medium italic opacity-60 leading-relaxed">System-generated audit: This purchase order represents a significant inventory intake. Ensure all items are physically verified against the packing list upon arrival.</p>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                            <h3 className="text-2xl font-black tracking-tight">Record Payment</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">৳</span>
                                    <input
                                        type="number"
                                        required
                                        max={balance}
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        className="w-full pl-10 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-black text-xl transition-all"
                                        placeholder="0.00"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPaymentForm({ ...paymentForm, amount: balance.toString() })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black bg-brand-100 text-brand-600 px-2 py-1 rounded-lg uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all"
                                    >Full Pay</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Method</label>
                                    <select
                                        value={paymentForm.paymentMethod}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all"
                                    >
                                        <option>Bank Transfer</option>
                                        <option>Cash</option>
                                        <option>BKash / Mobile</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Txn ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={paymentForm.transactionId}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all"
                                        placeholder="Ref No."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Notes</label>
                                <textarea
                                    value={paymentForm.note}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all h-24 resize-none"
                                    placeholder="Add payment details..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black transition-all shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                            >
                                <CheckCircle className="w-6 h-6" />
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
