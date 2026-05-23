'use client';

import { ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Brand, BrandFormProps } from '../type';
import { generateSlug } from '@/lib/generate-slug';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';



export default function BrandForm({ isOpen, onClose, onSubmit, initialData }: BrandFormProps) {
    const [formData, setFormData] = useState<Brand>({} as Brand);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData, isActive: initialData.isActive ?? true });
        } else {
            setFormData({ name: '', slug: '', description: '', website: '', isActive: true } as Brand);
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
                        {initialData ? 'Edit Brand' : 'New Brand'}
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
                            placeholder="e.g. Apple, Nike"
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
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Website URL</label>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={formData.website || ''}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell us about the brand..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            rows={3}
                        />
                    </div>
                    {/* Brand Logo */}
                    <div>
                        <ImageUploadField
                            label="Logo Image"
                            value={formData.image || ''}
                            onChange={(val) => setFormData({ ...formData, image: val })}
                            uploadApi={fetchAPI}
                            aspectRatio="square"
                            showUrlInput={true}
                            description="Upload brand logo or paste URL"
                        />
                    </div>
                    {/* Active toggle */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Status</div>
                            <div className="text-xs text-slate-400 mt-0.5">{formData.isActive ? 'Brand is visible in catalog' : 'Brand is hidden'}</div>
                        </div>
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
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : initialData ? 'Update Brand' : 'Create Brand'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
