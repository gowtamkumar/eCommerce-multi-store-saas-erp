'use client';

import { fetchAPI } from '@/services/api';
import { Mail, Phone, MapPin, User, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/shared/ConfirmModal';
import SupplierModal from './SupplierModal';
import { useDebounce } from '@/hooks/useDebounce';

// Memoized Supplier Row component to prevent full table re-renders
const SupplierRow = memo(({ supplier, onEdit, onDelete }: { supplier: any, onEdit: (s: any) => void, onDelete: (id: string) => void }) => {
    return (
        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl overflow-hidden text-slate-500">
                        <User className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{supplier.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{supplier.contactName || '-'}</td>
            <td className="px-6 py-4">
                <div className="space-y-1">
                    {supplier.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail className="w-3 h-3 text-brand-500" />
                            <span>{supplier.email}</span>
                        </div>
                    )}
                    {supplier.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="w-3 h-3 text-brand-500" />
                            <span>{supplier.phone}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                {supplier.address ? (
                    <div className="flex items-start gap-2 text-xs text-slate-500 max-w-xs">
                        <MapPin className="w-3 h-3 text-brand-500 mt-0.5 shrink-0" />
                        <span className="truncate" title={supplier.address}>{supplier.address}</span>
                    </div>
                ) : '-'}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(supplier)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(supplier.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

SupplierRow.displayName = 'SupplierRow';

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchSuppliers = useCallback(async (page: number, q: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                ...(q && { q })
            });
            const res = await fetchAPI(`/suppliers?${params}`);
            
            if (res.success && res.data) {
                setSuppliers(res.data.items || []);
                setPagination({
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    totalPages: res.data.totalPages
                });
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
            setIsSearchLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        fetchSuppliers(1, debouncedSearch);
    }, [debouncedSearch, fetchSuppliers]);

    const handleAdd = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((supplier: any) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Supplier',
            message: 'Are you sure you want to delete this supplier? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await fetchAPI(`/suppliers/${id}`, { method: 'DELETE' });
                    setSuppliers(prev => prev.filter((s) => s.id !== id));
                    toast.success('Supplier deleted successfully');
                } catch (error) {
                    toast.error('Error deleting supplier');
                }
            },
        });
    }, []);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSuppliers(newPage, debouncedSearch);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Suppliers</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your product suppliers and contact info</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Supplier
                </button>
            </div>

            <div className="relative group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchLoading ? 'text-brand-500 animate-pulse' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                <input
                    type="text"
                    placeholder="Search by name, contact or email..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchLoading(true);
                    }}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Supplier Entity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Representative</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Details</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Fulfillment Center</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                                            <Search className="w-8 h-8 text-slate-300" strokeWidth={1} />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No suppliers found</p>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <SupplierRow 
                                        key={supplier.id} 
                                        supplier={supplier} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDelete} 
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Page <span className="text-slate-900 dark:text-white">{pagination.page}</span> of <span className="text-slate-900 dark:text-white">{pagination.totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchSuppliers(pagination.page, debouncedSearch)}
                supplier={selectedSupplier}
            />
        </div>
    );
}
