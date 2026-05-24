'use client';

import { ChevronRight, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category, CategoryFormProps } from '../type';
import { generateSlug } from '@/lib/generate-slug';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';

export default function CategoryForm({ isOpen, onClose, onSubmit, initialData, allCategories = [] }: CategoryFormProps) {
    const [formData, setFormData] = useState<Category>({ name: '', slug: '', description: '', isActive: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData, isActive: initialData.isActive ?? true });
        } else {
            setFormData({ name: '', slug: '', description: '', isActive: true, parentId: null });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Exclude current category from parent options (can't be its own parent)
    const parentOptions = allCategories.filter(c => c.id !== initialData?.id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {initialData ? 'Edit Category' : 'New Category'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {initialData ? `Editing: ${initialData.name}` : 'Add a new product category to your catalog'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Electronics, Clothing, Beverages"
                            value={formData.name || ''}
                            onChange={(e) => {
                                const name = e.target.value;
                                const slug = initialData ? formData.slug : generateSlug(name);
                                setFormData({ ...formData, name, slug });
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Slug (URL)</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
                            <span className="text-slate-400 text-sm shrink-0">/categories/</span>
                            <input
                                type="text"
                                required
                                value={formData.slug || ''}
                                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-mono text-xs"
                            />
                        </div>
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Parent Category
                            <span className="ml-2 text-[10px] font-normal text-slate-400">(Optional — leave blank for top-level)</span>
                        </label>
                        <div className="relative">
                            <ChevronRight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.parentId || ''}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                            >
                                <option value="">— Top Level (No Parent) —</option>
                                {parentOptions.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what's in this category..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Category Image */}
                    <div>
                        <ImageUploadField
                            label="Category Image"
                            value={formData.image || ''}
                            onChange={(val) => setFormData({ ...formData, image: val })}
                            uploadApi={fetchAPI}
                            aspectRatio="square"
                            showUrlInput={true}
                            description="Upload category image or paste URL"
                        />
                    </div>

                    {/* Sort Order + isActive row */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sort Order</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.sortOrder ?? 0}
                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 pt-5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`transition-colors ${formData.isActive ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                            >
                                {formData.isActive
                                    ? <ToggleRight className="w-9 h-9" />
                                    : <ToggleLeft className="w-9 h-9" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
