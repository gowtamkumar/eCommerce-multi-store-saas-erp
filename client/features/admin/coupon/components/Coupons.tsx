'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import { fetchAPI } from '@/services/api';
import { Plus, Search, Tag, Ticket, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CouponForm from './CouponForm';

export default function Coupons() {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI(`/coupons?search=${searchTerm}`, { method: 'GET' });
            if (res.success) {
                setCoupons(res.data.coupons || []);
            }
        } catch (error) {
            console.error('Error loading coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const res = await fetchAPI(`/coupons/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Coupon deleted');
                loadCoupons();
            } else {
                toast.error(res.message || 'Failed to delete coupon');
            }
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleEdit = (coupon: any) => {
        setSelectedCoupon(coupon);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-brand-600" />
                        Coupons & Discounts
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage promotional codes and discounts for your customers
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedCoupon(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm shadow-brand-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Create Coupon
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative z-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Code</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Discount</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Usage</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Expiry</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                                        </div>
                                        Loading coupons...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                        <p>No coupons found. Create one to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 cursor-pointer" onClick={() => handleEdit(coupon)}>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600">
                                                {coupon.code}
                                            </div>
                                            {coupon.description && (
                                                <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{coupon.description}</p>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium" onClick={() => handleEdit(coupon)}>
                                            {coupon.discountType === 'percentage'
                                                ? `${coupon.amount}% off`
                                                : coupon.discountType === 'free_shipping'
                                                    ? 'Free Shipping'
                                                    : `${formatCurrency(coupon.amount, currency)} off`}
                                            {coupon.minPurchaseAmount > 0 && (
                                                <span className="block text-xs font-normal text-slate-500 mt-1">
                                                    Min. {formatCurrency(coupon.minPurchaseAmount, currency)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => handleEdit(coupon)}>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-medium">
                                                    {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}
                                                </div>
                                                {coupon.usageLimit && (
                                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand-500 rounded-full"
                                                            style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => handleEdit(coupon)}>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${coupon.isActive
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 cursor-pointer" onClick={() => handleEdit(coupon)}>
                                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <CouponForm
                    coupon={selectedCoupon}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadCoupons();
                    }}
                />
            )}
        </div>
    );
}
