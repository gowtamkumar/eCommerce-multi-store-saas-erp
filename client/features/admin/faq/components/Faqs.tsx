'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import ConfirmModal from '@/components/shared/ConfirmModal';
import DebouncedInput from '@/components/shared/DebouncedInput';
import { fetchAPI } from '@/services/api';
import { Edit, HelpCircle, Plus, Search, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { FAQ } from '../type';
import { FAQModal } from './FAQModal';

const ITEMS_PER_PAGE = 10;
type FAQFormData = Pick<FAQ, 'question' | 'answer' | 'order' | 'status'>;

export default function FAQs() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal & Action State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: '',
        title: '',
        message: '',
    });

    const fetchFaqs = useCallback(async (currentPage: number, search: string) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                ...(search && { q: search }),
            });

            const res = await fetchAPI(`/faqs?${queryParams.toString()}`);
            if (res.success && res.data) {
                setFaqs(res.data.faqs || []);
                setTotal(res.data.total || 0);
            }
        } catch (error) {
            toast.error('Failed to load FAQs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void fetchFaqs(page, searchQuery);
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [page, searchQuery, fetchFaqs]);

    const handleSearch = useCallback((val: string) => {
        setSearchQuery(val);
        setPage(1); // Reset to first page on new search
    }, []);

    const handleModalSubmit = async (formData: FAQFormData) => {
        try {
            const url = editingFaq ? `/faqs/${editingFaq.id}` : '/faqs';
            const method = editingFaq ? 'PATCH' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.success) {
                toast.success(`FAQ ${editingFaq ? 'updated' : 'created'} successfully`);
                fetchFaqs(page, searchQuery);
                setIsModalOpen(false);
                setEditingFaq(null);
            }
        } catch {
            toast.error('Error saving FAQ');
        }
    };

    const handleDelete = async () => {
        if (!confirmModal.id) return;
        try {
            const res = await fetchAPI(`/faqs/${confirmModal.id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('FAQ deleted successfully');
                fetchFaqs(page, searchQuery);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        } catch {
            toast.error('Error deleting FAQ');
        }
    };

    const openModal = useCallback((faq?: FAQ) => {
        setEditingFaq(faq || null);
        setIsModalOpen(true);
    }, []);

    const totalPages = useMemo(() => Math.ceil(total / ITEMS_PER_PAGE), [total]);
    const columns = useMemo<DataTableColumn<FAQ>[]>(() => [
        {
            key: 'order',
            header: '# Order',
            cell: (faq) => (
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center border border-brand-100 dark:border-brand-800">
                    <span className="text-xs font-black text-brand-600 dark:text-brand-400">{faq.order}</span>
                </div>
            ),
        },
        {
            key: 'content',
            header: 'FAQ Content',
            cell: (faq) => (
                <div className="space-y-1 max-w-xl">
                    <h4 className="font-bold text-slate-900 dark:text-white leading-snug">{faq.question}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{faq.answer}</p>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (faq) => (
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${faq.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                    {faq.status}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (faq) => (
                <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button
                        onClick={() => openModal(faq)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                        title="Edit FAQ"
                    >
                        <Edit className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => setConfirmModal({
                            isOpen: true,
                            id: faq.id,
                            title: 'Delete FAQ',
                            message: 'Are you sure you want to delete this FAQ? This action cannot be undone.'
                        })}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Delete FAQ"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                </div>
            ),
        },
    ], [openModal]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">FAQs</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage frequently asked questions for your store.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="w-full md:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Add FAQ
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-brand-500" />
                <DebouncedInput
                    type="text"
                    placeholder="Search questions or answers..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                />
            </div>

            <DataTable
                data={faqs}
                columns={columns}
                getRowKey={(faq) => faq.id}
                loading={loading}
                loadingLabel="Loading FAQs..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <HelpCircle className="w-12 h-12 opacity-20" />
                        <p className="font-bold">No FAQs found.</p>
                    </div>
                }
                pagination={{
                    page,
                    total,
                    totalPages,
                    onPageChange: setPage,
                }}
                paginationSummary={
                    <p className="text-xs font-bold text-slate-500">
                        Showing <span className="text-slate-900 dark:text-white">{faqs.length}</span> of <span className="text-slate-900 dark:text-white">{total}</span> FAQs
                    </p>
                }
            />

            {/* Modals */}
            <FAQModal
                isOpen={isModalOpen}
                editingFaq={editingFaq}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                defaultOrder={total}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={true}
            />
        </div>
    );
}
