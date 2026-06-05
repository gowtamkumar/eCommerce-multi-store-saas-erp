'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Promotion } from '../types';
import { usePromotionForm } from './hooks/usePromotionForm';
import PromotionFormFields from './PromotionFormFields';

interface PromotionFormProps {
    promotion?: Promotion | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PromotionForm({ promotion, onClose, onSuccess }: PromotionFormProps) {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';
    const {
        formData,
        loading,
        copied,
        brands,
        categories,
        products,
        isEdit,
        setField,
        changeName,
        changeSlug,
        copyOfferUrl,
        submit,
    } = usePromotionForm(promotion, onSuccess);

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
                        {isEdit ? 'Edit Promotion' : 'Create New Promotion'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="promoForm" onSubmit={submit} className="space-y-6">
                        <PromotionFormFields
                            formData={formData}
                            currency={currency}
                            brands={brands}
                            categories={categories}
                            products={products}
                            copied={copied}
                            onNameChange={changeName}
                            onSlugChange={changeSlug}
                            onFieldChange={setField}
                            onCopyLink={copyOfferUrl}
                        />
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
                        ) : isEdit ? 'Save Changes' : 'Create Offer'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
