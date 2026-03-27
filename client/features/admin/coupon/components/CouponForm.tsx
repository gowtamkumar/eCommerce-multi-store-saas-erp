'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { DiscountType } from '@/lib/enums/discount-type.enum';
import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Calendar, Percent, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CouponFormProps {
    coupon?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CouponForm({ coupon, onClose, onSuccess }: CouponFormProps) {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        amount: '',
        minPurchaseAmount: '',
        usageLimit: '',
        startDate: '',
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code || '',
                description: coupon.description || '',
                discountType: coupon.discountType || 'percentage',
                amount: coupon.amount || '',
                minPurchaseAmount: coupon.minPurchaseAmount || '',
                usageLimit: coupon.usageLimit || '',
                startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
                isActive: coupon.isActive ?? true
            });
        }
    }, [coupon]);

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            amount: Number(formData.amount),
            minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : 0,
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        };

        try {
            const url = coupon ? `/coupons/${coupon.id}` : '/coupons';
            const method = coupon ? 'PATCH' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.success || res.code) { // if saving creates coupon, res structure may vary
                toast.success(coupon ? 'Coupon updated' : 'Coupon created');
                onSuccess();
            } else {
                toast.error(res.message || 'Failed to save coupon');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {coupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="couponForm" onSubmit={handleSubmit} className="space-y-6">
                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Active Status</h3>
                                <p className="text-xs text-slate-500">Enable or disable this coupon from being used.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SUMMER2024"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Generate
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. 20% off all summer items"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Value & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Discount Type</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                >
                                    <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
                                    <option value={DiscountType.FIXED}>Fixed Amount ({currency})</option>
                                    <option value={DiscountType.FREE_SHIPPING}>Free Shipping</option>
                                </select>
                            </div>
                            {formData.discountType !== DiscountType.FREE_SHIPPING && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Discount Value</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                            {formData.discountType === 'fixed' ? currency : <Percent className="w-4 h-4" />}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        {/* Rules & Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white text-sm">Min Purchase Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minPurchaseAmount}
                                        onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                        placeholder="Leave empty for no minimum"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                        {currency}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Usage Limit (Total)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white text-sm">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white text-sm">Expiry Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="couponForm"
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20 flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : coupon ? 'Save Changes' : 'Create Coupon'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
