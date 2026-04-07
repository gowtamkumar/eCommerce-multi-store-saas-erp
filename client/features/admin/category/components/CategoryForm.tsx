'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category, CategoryFormProps } from '../type';
import { generateSlug } from '@/lib/generate-slug';

export default function CategoryForm({ isOpen, onClose, onSubmit, initialData }: CategoryFormProps) {
    const [formData, setFormData] = useState<Category>({} as Category);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({} as Category);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Edit Category' : 'New Category'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Electronics, Clothing"
                            value={formData.name || ''}
                            onChange={(e) => {
                                const name = e.target.value;
                                const slug = initialData ? formData.slug : generateSlug(name);
                                setFormData({ ...formData, name, slug });
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Slug</label>
                        <input
                            type="text"
                            required
                            value={formData.slug || ''}
                            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 font-mono text-xs"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what's in this category..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Image URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/category-image.png"
                            value={formData.image || ''}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
