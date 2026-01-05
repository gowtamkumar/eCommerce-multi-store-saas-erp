'use client';

import RichEditor from '@/components/admin/RichEditor';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageEditor({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        status: 'published' as 'draft' | 'published',
    });

    useEffect(() => {
        const fetchPage = async () => {
            const { id } = await params;
            if (id === 'new') return;

            setIsNew(false);
            setLoading(true);
            try {
                const res = await fetch(`/api/pages/${id}`);
                const data = await res.json();
                if (data.success) {
                    setFormData({
                        title: data.data.title,
                        slug: data.data.slug,
                        content: data.data.content,
                        status: data.data.status || 'draft',
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { id } = await params;
            const url = isNew ? '/api/pages' : `/api/pages/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/pages');
                router.refresh();
                toast.success('Page saved successfully');
            } else {
                toast.error('Failed to save page');
            }
        } catch (error) {
            toast.error('Error saving page');
        } finally {
            setSaving(false);
        }
    };

    // Auto-generate slug from title if new
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        if (isNew) {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, title, slug }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/pages"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                        {isNew ? 'Create Page' : 'Edit Page'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 max-w-4xl">
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Page Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="e.g., About Us"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug (URL)</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="e.g., about-us"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Content</label>
                        <RichEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</label>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="published"
                                    checked={formData.status === 'published'}
                                    onChange={(e) => setFormData({ ...formData, status: 'published' })}
                                    className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Published</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="draft"
                                    checked={formData.status === 'draft'}
                                    onChange={(e) => setFormData({ ...formData, status: 'draft' })}
                                    className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Draft</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Page</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
