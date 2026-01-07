'use client';

import RichEditor from '@/components/admin/RichEditor';
import ConfirmModal from '@/components/ConfirmModal';
import { Eye, GripVertical, HelpCircle, Layout as LayoutIcon, Pencil, Plus, Type as RichTextIcon, Save, Send, ShoppingCart, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Page {
    _id: string;
    title: string;
    slug: string;
    content: string;
    contentType: 'html' | 'markdown';
    metaDescription?: string;
    status: 'draft' | 'published';
    sections?: Array<{
        id: string;
        type: string;
        content: any;
        order: number;
    }>;
    createdAt: string;
}

export default function PagesManager() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState<Partial<Page>>({});
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/pages');
            const data = await res.json();
            if (data.success) {
                setPages(data.pages);
            }
        } catch (error) {
            console.error('Failed to fetch pages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentPage._id ? `/api/pages/${currentPage._id}` : '/api/pages';
            const method = currentPage._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPage),
            });

            if (res.ok) {
                fetchPages();
                setIsEditing(false);
                setCurrentPage({});
                toast.success('Page saved successfully');
            }
        } catch (error) {
            console.error('Failed to save page', error);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Page',
            message: 'Are you sure you want to delete this page? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        fetchPages();
                        toast.success('Page deleted successfully');
                    } else {
                        toast.error('Failed to delete page');
                    }
                } catch (error) {
                    console.error('Failed to delete page', error);
                    toast.error('Error deleting page');
                }
            },
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Pages Management</h1>
                <button
                    onClick={() => { setIsEditing(true); setCurrentPage({ status: 'draft', contentType: 'html' }); }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Page
                </button>
            </div>

            {isEditing && (
                <div className="mb-8 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                                {currentPage._id ? 'Edit Page' : 'Create New Page'}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all font-bold"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Page Title</label>
                                <input
                                    type="text"
                                    value={currentPage.title || ''}
                                    onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={currentPage.slug || ''}
                                    onChange={(e) => setCurrentPage({ ...currentPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="about-us"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Content Type</label>
                                <select
                                    value={currentPage.contentType || 'markdown'}
                                    onChange={(e) => setCurrentPage({ ...currentPage, contentType: e.target.value as 'html' | 'markdown' })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                >
                                    <option value="markdown">Markdown</option>
                                    <option value="html">HTML</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                                <select
                                    value={currentPage.status || 'draft'}
                                    onChange={(e) => setCurrentPage({ ...currentPage, status: e.target.value as 'draft' | 'published' })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Page Content & Sections Builder */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-6">
                            {/* Main Content (Rich Editor) */}
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <RichTextIcon className="w-5 h-5 text-brand-600" /> Default Content (Legacy)
                                </h3>
                                <RichEditor
                                    content={currentPage.content || ''}
                                    onChange={(content) => setCurrentPage({ ...currentPage, content })}
                                />
                            </div>

                            {/* Section Items */}
                            <div className="space-y-4">
                                {(currentPage.sections || []).sort((a: any, b: any) => a.order - b.order).map((section: any, index: number) => (
                                    <div key={section.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-move">
                                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-200 capitalize flex items-center gap-2">
                                                    {section.type === 'hero' && <LayoutIcon className="w-4 h-4 text-brand-600" />}
                                                    {section.type === 'content' && <RichTextIcon className="w-4 h-4 text-brand-600" />}
                                                    {section.type === 'faq' && <HelpCircle className="w-4 h-4 text-brand-600" />}
                                                    {section.type === 'testimonials' && <Users className="w-4 h-4 text-brand-600" />}
                                                    {section.type === 'products' && <ShoppingCart className="w-4 h-4 text-brand-600" />}
                                                    {section.type === 'cta' && <Send className="w-4 h-4 text-brand-600" />}
                                                    {section.type} Block
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newSections = (currentPage.sections || []).filter((s: any) => s.id !== section.id);
                                                        setCurrentPage({ ...currentPage, sections: newSections });
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            {/* Section Specific Editors */}
                                            {section.type === 'hero' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Heading</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Main Heading"
                                                                value={section.content?.heading || ''}
                                                                onChange={(e) => {
                                                                    const next = [...(currentPage.sections || [])];
                                                                    const idx = next.findIndex((s: any) => s.id === section.id);
                                                                    next[idx].content = { ...next[idx].content, heading: e.target.value };
                                                                    setCurrentPage({ ...currentPage, sections: next });
                                                                }}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtext</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Subtext / Tagline"
                                                                value={section.content?.subtext || ''}
                                                                onChange={(e) => {
                                                                    const next = [...(currentPage.sections || [])];
                                                                    const idx = next.findIndex((s: any) => s.id === section.id);
                                                                    next[idx].content = { ...next[idx].content, subtext: e.target.value };
                                                                    setCurrentPage({ ...currentPage, sections: next });
                                                                }}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {section.type === 'content' && (
                                                <RichEditor
                                                    content={section.content?.text || ''}
                                                    onChange={(text) => {
                                                        const next = [...(currentPage.sections || [])];
                                                        const idx = next.findIndex((s: any) => s.id === section.id);
                                                        next[idx].content = { ...next[idx].content, text };
                                                        setCurrentPage({ ...currentPage, sections: next });
                                                    }}
                                                />
                                            )}
                                            {section.type === 'cta' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CTA Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Are you ready?"
                                                            value={section.content?.title || ''}
                                                            onChange={(e) => {
                                                                const next = [...(currentPage.sections || [])];
                                                                const idx = next.findIndex((s: any) => s.id === section.id);
                                                                next[idx].content = { ...next[idx].content, title: e.target.value };
                                                                setCurrentPage({ ...currentPage, sections: next });
                                                            }}
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Button Text</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Get Started"
                                                            value={section.content?.buttonText || ''}
                                                            onChange={(e) => {
                                                                const next = [...(currentPage.sections || [])];
                                                                const idx = next.findIndex((s: any) => s.id === section.id);
                                                                next[idx].content = { ...next[idx].content, buttonText: e.target.value };
                                                                setCurrentPage({ ...currentPage, sections: next });
                                                            }}
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {section.type === 'products' && (
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        This section will automatically display your 6 latest active products in a grid layout.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Section Button */}
                            <div className="flex justify-center py-4">
                                <div className="flex flex-wrap items-center justify-center gap-3 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4">Add Block:</span>
                                    {[
                                        { type: 'hero', icon: LayoutIcon },
                                        { type: 'content', icon: RichTextIcon },
                                        { type: 'cta', icon: Send },
                                        { type: 'faq', icon: HelpCircle },
                                        { type: 'testimonials', icon: Users },
                                        { type: 'products', icon: ShoppingCart }
                                    ].map(block => {
                                        const Icon = block.icon;
                                        return (
                                            <button
                                                key={block.type}
                                                type="button"
                                                onClick={() => {
                                                    const id = Math.random().toString(36).substring(7);
                                                    const newSection = { id, type: block.type, content: {}, order: (currentPage.sections || []).length };
                                                    setCurrentPage({
                                                        ...currentPage,
                                                        sections: [...(currentPage.sections || []), newSection]
                                                    } as any);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 rounded-xl transition-all text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 group/btn"
                                            >
                                                <Icon className="w-4 h-4 text-brand-600 group-hover/btn:text-white transition-colors" />
                                                <span className="text-slate-700 dark:text-slate-300 group-hover/btn:text-white transition-colors capitalize">{block.type}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">SEO & Metadata</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Meta Description</label>
                                        <textarea
                                            rows={4}
                                            value={currentPage.metaDescription || ''}
                                            onChange={(e) => setCurrentPage({ ...currentPage, metaDescription: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                            placeholder="Brief description for search engines"
                                        />
                                    </div>
                                    <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/20">
                                        <p className="text-xs text-brand-600 dark:text-brand-400 leading-relaxed font-medium">
                                            Tip: Keep your meta description under 160 characters for best results in Google search results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Title</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Slug</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading pages...</td>
                            </tr>
                        ) : pages.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pages found. Create your first page!</td>
                            </tr>
                        ) : (
                            pages.map((page) => (
                                <tr key={page._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{page.title}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-sm">{page.slug}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{page.contentType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.status === 'published'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/page/${page.slug}`}
                                                target="_blank"
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="View Page"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => { setCurrentPage(page); setIsEditing(true); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </div>
    );
}
