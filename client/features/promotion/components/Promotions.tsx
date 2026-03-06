'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import { deletePromotion, getPromotions, Promotion } from '@/services/promotion';
import { Plus, Search, Tag, Megaphone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PromotionForm from './PromotionForm';

export default function Promotions() {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const res = await getPromotions(1, 100, searchTerm);
            const data = res.data?.promotions || res.promotions || [];
            setPromotions(data);
        } catch (error) {
            console.error('Error loading promotions:', error);
            toast.error('Failed to load promotional offers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotional offer?')) return;

        try {
            const res = await deletePromotion(id);
            if (res.success) {
                toast.success('Promotion deleted');
                loadPromotions();
            } else {
                toast.error(res.message || 'Failed to delete promotion');
            }
        } catch (error) {
            toast.error('Failed to delete promotion');
        }
    };

    const handleEdit = (promo: Promotion) => {
        setSelectedPromotion(promo);
        setIsFormOpen(true);
    };

    const formatTargetType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-brand-600" />
                        Promotional Offers
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage automatic discounts, flash sales, and targeted brand offers
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedPromotion(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm shadow-brand-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Create Promotion
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative z-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search promotional offers..."
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
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Offer Name</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Type / Value</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Conditions</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                                        </div>
                                        Loading promotional offers...
                                    </td>
                                </tr>
                            ) : promotions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                        <p>No active promotional offers. Create one to drive sales.</p>
                                    </td>
                                </tr>
                            ) : (
                                promotions.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 cursor-pointer" onClick={() => handleEdit(promo)}>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {promo.name}
                                            </div>
                                            {promo.description && (
                                                <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{promo.description}</p>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium" onClick={() => handleEdit(promo)}>
                                            {promo.promotionType === 'free_shipping' ? (
                                                <span className="text-brand-600 dark:text-brand-400">Free Shipping</span>
                                            ) : promo.promotionType === 'percentage' ? (
                                                `${promo.value}% Off`
                                            ) : (
                                                `${formatCurrency(promo.value || 0, currency)} Off`
                                            )}
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => handleEdit(promo)}>
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    Targeting: {formatTargetType(promo.targetType)}
                                                </span>
                                                {promo.minOrderValue && promo.minOrderValue > 0 && (
                                                    <span className="text-xs text-slate-500">
                                                        Min Spend: {formatCurrency(promo.minOrderValue, currency)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => handleEdit(promo)}>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${promo.isActive
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {promo.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                {promo.endDate ? `Ends ${new Date(promo.endDate).toLocaleDateString()}` : 'No Expiry'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(promo.id)}
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
                <PromotionForm
                    promotion={selectedPromotion}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadPromotions();
                    }}
                />
            )}
        </div>
    );
}
