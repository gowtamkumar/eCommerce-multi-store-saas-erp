'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Scale, 
    Plus, 
    Trash2, 
    Edit2, 
    X, 
    Loader2, 
    Calendar, 
    BadgeDollarSign, 
    Check, 
    ShieldAlert, 
    Clock, 
    Tag 
} from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function PriceBooks() {
    const [priceBooks, setPriceBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'RETAIL',
        currency: 'BDT',
        isActive: true,
        validFrom: '',
        validTo: ''
    });

    useEffect(() => {
        loadPriceBooks();
    }, []);

    const loadPriceBooks = async () => {
        try {
            setLoading(true);
            const res = await fetchAPI('/pricing/price-books');
            if (res.success) {
                setPriceBooks(res.data || []);
            }
        } catch (error) {
            console.error('Failed to load price books', error);
            toast.error('Failed to load Price Books');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'RETAIL',
            currency: 'BDT',
            isActive: true,
            validFrom: '',
            validTo: ''
        });
        setEditingBook(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (book: any) => {
        setEditingBook(book);
        setFormData({
            name: book.name,
            code: book.code,
            type: book.type,
            currency: book.currency || 'BDT',
            isActive: book.isActive,
            validFrom: book.validFrom ? new Date(book.validFrom).toISOString().slice(0, 16) : '',
            validTo: book.validTo ? new Date(book.validTo).toISOString().slice(0, 16) : ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingBook ? `/pricing/price-books/${editingBook.id}` : '/pricing/price-books';
            const method = editingBook ? 'PATCH' : 'POST';

            // Clean up payload dates
            const payload = {
                ...formData,
                validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
                validTo: formData.validTo ? new Date(formData.validTo).toISOString() : null
            };

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.success) {
                toast.success(`Price Book ${editingBook ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
                resetForm();
                loadPriceBooks();
            }
        } catch (error: any) {
            console.error('Error saving price book', error);
            toast.error(error.message || 'Error saving Price Book');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Price Book',
            message: 'Are you sure you want to delete this price book? This action cannot be undone and any assigned custom pricing tiers will be permanently removed.',
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(`/pricing/price-books/${id}`, { method: 'DELETE' });
                    if (res.success) {
                        toast.success('Price Book deleted successfully');
                        setPriceBooks(prev => prev.filter(b => b.id !== id));
                    }
                } catch (error) {
                    console.error('Error deleting price book', error);
                    toast.error('Error deleting Price Book');
                }
            }
        });
    };

    const filteredBooks = priceBooks.filter(book => 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-brand-600" />
                        Price Books Management
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Create and manage localized price catalogues, currency rules, and promotional pricing structures.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 self-start md:self-center"
                >
                    <Plus className="w-4 h-4" />
                    New Price Book
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search price books by name, code or type..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                />
            </div>

            {/* Price Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                    <motion.div
                        key={book.id}
                        layout
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                                    <BadgeDollarSign className="w-6 h-6 text-brand-600" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEditModal(book)} 
                                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                        title="Edit Price Book"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(book.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        title="Delete Price Book"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{book.name}</h5>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-xs font-mono text-slate-400 font-bold">{book.code}</span>
                                <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 rounded text-[10px] font-black uppercase tracking-wider">
                                    {book.type}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-black uppercase tracking-wider">
                                    {book.currency}
                                </span>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>
                                        {book.validFrom ? (
                                            <>Valid: {new Date(book.validFrom).toLocaleDateString()} &rarr; {book.validTo ? new Date(book.validTo).toLocaleDateString() : 'Forever'}</>
                                        ) : (
                                            'Always Applicable'
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className={`w-4 h-4 ${book.isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <span className="font-bold">
                                        {book.isActive ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">Active / Receiving Overrides</span>
                                        ) : (
                                            <span className="text-slate-400">Disabled / Offline</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredBooks.length === 0 && (
                    <div className="col-span-full py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        <span>No price books found. Create one to begin customizing your catalog pricing.</span>
                    </div>
                )}
            </div>

            {/* Price Book Form Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                {editingBook ? 'Edit Price Book' : 'New Price Book'}
                            </h4>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                                        placeholder="e.g. Eid Campaign Price Book"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Code / Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                                        placeholder="e.g. EID-2026"
                                        disabled={!!editingBook} // Code shouldn't change once created
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none"
                                        >
                                            <option value="RETAIL">Retail</option>
                                            <option value="WHOLESALE">Wholesale</option>
                                            <option value="PROMOTIONAL">Promotional</option>
                                            <option value="CUSTOMER_SPECIFIC">Customer Specific</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                                            placeholder="BDT"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Valid From</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Valid To</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validTo}
                                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300 font-bold cursor-pointer">Active</label>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all text-sm"
                                    >
                                        {editingBook ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={true}
            />
        </div>
    );
}
