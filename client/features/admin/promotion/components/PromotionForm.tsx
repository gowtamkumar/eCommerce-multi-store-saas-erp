'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { createPromotion, updatePromotion, Promotion } from '@/services/promotion';
import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Calendar, Copy, Percent, X, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DiscountType } from '@/lib/enums/discount-type';

interface PromotionFormProps {
    promotion?: Promotion | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PromotionForm({ promotion, onClose, onSuccess }: PromotionFormProps) {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        promotionType: 'percentage',
        value: '',
        targetType: 'entire_order',
        targetId: '',
        minOrderValue: '',
        startDate: '',
        endDate: '',
        isActive: true
    });

    // For fetching target options
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [products, setProducts] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        // Fetch lookup data for select fields
        const fetchData = async () => {
            try {
                const brand = await fetchAPI('/brands')
                setBrands(brand.data || []);
                const category = await fetchAPI('/categories')
                setCategories(category.data || []);
                const product = await fetchAPI('/products?limit=100')
                setProducts(product?.data?.products || []);
            } catch (err) {
                console.log("err", err);
            }
        };
        fetchData();
    }, []);



    useEffect(() => {
        if (promotion) {
            setFormData({
                name: promotion.name || '',
                slug: promotion.slug || '',
                description: promotion.description || '',
                promotionType: promotion.promotionType || 'percentage',
                value: promotion.value ? String(promotion.value) : '',
                targetType: promotion.targetType || 'entire_order',
                targetId: promotion.targetId || '',
                minOrderValue: promotion.minOrderValue ? String(promotion.minOrderValue) : '',
                startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
                endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
                isActive: promotion.isActive ?? true
            });
        }
    }, [promotion]);

    const [copied, setCopied] = useState(false);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        const newSlug = generateSlug(newName);

        // Only auto-update slug if it was empty or matched the previous auto-generated slug
        if (!formData.slug || formData.slug === generateSlug(formData.name)) {
            setFormData({ ...formData, name: newName, slug: newSlug });
        } else {
            setFormData({ ...formData, name: newName });
        }
    };

    const copyToClipboard = () => {
        const url = `${window.location.origin}/offers/${formData.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Offer URL copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: Partial<Promotion> = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            promotionType: formData.promotionType as any,
            targetType: formData.targetType as any,
            isActive: formData.isActive,
        };

        if (formData.value) payload.value = Number(formData.value);
        if (formData.minOrderValue) payload.minOrderValue = Number(formData.minOrderValue);

        if (['specific_product', 'specific_category', 'specific_brand'].includes(formData.targetType)) {
            if (!formData.targetId) {
                toast.error('Please select a target item');
                setLoading(false);
                return;
            }
            payload.targetId = formData.targetId;
        }

        if (formData.startDate) payload.startDate = new Date(formData.startDate).toISOString();
        if (formData.endDate) payload.endDate = new Date(formData.endDate).toISOString();

        try {
            let res;
            if (promotion && promotion.id) {
                res = await updatePromotion(promotion.id, payload);
            } else {
                res = await createPromotion(payload);
            }

            if (res && !res.error) {
                toast.success(promotion ? 'Promotion updated' : 'Promotion created');
                onSuccess();
            } else {
                toast.error(res?.message || 'Failed to save promotion');
            }
        } catch (error) {
            toast.error('An error occurred while saving.');
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
                        {promotion ? 'Edit Promotion' : 'Create New Promotion'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="promoForm" onSubmit={handleSubmit} className="space-y-6">
                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Active Status</h3>
                                <p className="text-xs text-slate-500">Enable or disable this promotional offer.</p>
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
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Promotion Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Summer Brand Sale"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white flex justify-between items-center">
                                    Slug (URL identifier)
                                    {formData.slug && (
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            className="text-[10px] uppercase tracking-wider font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                        >
                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                        placeholder="summer-brand-sale"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">/offers/</span>
                                </div>
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Internal notes or public description"
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
                                    value={formData.promotionType}
                                    onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })}
                                >
                                    <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
                                    <option value={DiscountType.FIXED}>Fixed Amount ({currency})</option>
                                    <option value={DiscountType.FREE_SHIPPING}>Free Shipping</option>
                                </select>
                            </div>

                            {formData.promotionType !== DiscountType.FREE_SHIPPING && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Discount Value</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                            {formData.promotionType === 'fixed' ? currency : <Percent className="w-4 h-4" />}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        {/* Targeting */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Applies To</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                    value={formData.targetType}
                                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
                                >
                                    <option value="entire_order">Entire Order</option>
                                    <option value="minimum_cart_value">Minimum Cart Value</option>
                                    <option value="specific_product">Specific Product</option>
                                    <option value="specific_category">Specific Category</option>
                                    <option value="specific_brand">Specific Brand</option>
                                </select>
                            </div>

                            {['specific_brand', 'specific_category', 'specific_product'].includes(formData.targetType) && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Target Selection</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                        value={formData.targetId}
                                        onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                    >
                                        <option value="">Select Target...</option>
                                        {formData.targetType === 'specific_brand' && brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        {formData.targetType === 'specific_category' && categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        {formData.targetType === 'specific_product' && products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {(formData.targetType === 'minimum_cart_value') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Minimum Order Value</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.minOrderValue}
                                            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                            {currency}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white text-sm">Start Date (Optional)</label>
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
                                <label className="text-sm font-semibold text-slate-900 dark:text-white text-sm">Expiry Date (Optional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                        form="promoForm"
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20 flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : promotion ? 'Save Changes' : 'Create Offer'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
