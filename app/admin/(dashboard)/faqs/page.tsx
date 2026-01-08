'use client';

import ConfirmModal from '@/components/ConfirmModal';
import { fetchAPI } from '@/lib/api';
import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    status: 'active' | 'inactive';
}

export default function FAQsPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFAQ, setCurrentFAQ] = useState<Partial<FAQ>>({});
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const res = await fetchAPI('/faqs');
            if (res.success && res.data) {
                setFaqs(res.data.faqs);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentFAQ._id ? `/faqs/${currentFAQ._id}` : '/faqs';
            const method = currentFAQ._id ? 'PUT' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(currentFAQ),
            });

            if (res.success) {
                fetchFAQs();
                setIsEditing(false);
                setCurrentFAQ({});
                toast.success('FAQ saved successfully');
            }
        } catch (error) {
            console.error('Failed to save FAQ', error);
            toast.error('Failed to save FAQ');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete FAQ',
            message: 'Are you sure you want to delete this FAQ? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(`/faqs/${id}`, { method: 'DELETE' });
                    if (res.success) {
                        fetchFAQs();
                        toast.success('FAQ deleted successfully');
                    } else {
                        toast.error('Failed to delete FAQ');
                    }
                } catch (error) {
                    console.error('Failed to delete FAQ', error);
                    toast.error('Error deleting FAQ');
                }
            },
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">FAQs Management</h1>
                <button
                    onClick={() => { setIsEditing(true); setCurrentFAQ({ status: 'active', order: 0 }); }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add FAQ
                </button>
            </div>

            {isEditing && (
                <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question</label>
                                <input
                                    type="text"
                                    value={currentFAQ.question || ''}
                                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={currentFAQ.category || ''}
                                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order</label>
                                <input
                                    type="number"
                                    value={currentFAQ.order || 0}
                                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    value={currentFAQ.status || 'active'}
                                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Answer</label>
                            <textarea
                                value={currentFAQ.answer || ''}
                                onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {loading ? (
                    <p className="text-center text-slate-500">Loading FAQs...</p>
                ) : faqs.map((faq) => (
                    <div key={faq._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{faq.answer}</p>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                                    {faq.category}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${faq.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                                    {faq.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setCurrentFAQ(faq); setIsEditing(true); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(faq._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </div >
    );
}
