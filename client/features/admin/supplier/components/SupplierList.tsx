'use client';

import { fetchAPI } from '@/services/api';
import { Mail, Phone, MapPin, User, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/shared/ConfirmModal';
import SupplierModal from './SupplierModal';

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetchAPI('/suppliers');
            setSuppliers(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const handleEdit = (supplier: any) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Supplier',
            message: 'Are you sure you want to delete this supplier? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await fetchAPI(`/suppliers/${id}`, { method: 'DELETE' });
                    setSuppliers(suppliers.filter((s) => s.id !== id));
                    toast.success('Supplier deleted successfully');
                } catch (error) {
                    toast.error('Error deleting supplier');
                }
            },
        });
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Suppliers</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your product suppliers and contact info</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Supplier
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name, contact or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-500 italic">
                        Loading suppliers...
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        {searchQuery ? 'No suppliers match your search.' : 'No suppliers found. Click "Add Supplier" to create one.'}
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group relative">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(supplier)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pr-16">{supplier.name}</h3>

                            <div className="space-y-3">
                                {supplier.contactName && (
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <User className="w-4 h-4 text-brand-500" />
                                        <span className="text-sm font-medium">{supplier.contactName}</span>
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <Mail className="w-4 h-4 text-brand-500" />
                                        <span className="text-sm truncate">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <Phone className="w-4 h-4 text-brand-500" />
                                        <span className="text-sm">{supplier.phone}</span>
                                    </div>
                                )}
                                {supplier.address && (
                                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 text-brand-500 mt-0.5" />
                                        <span className="text-sm line-clamp-2">{supplier.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                                <span className="text-xs text-slate-400">Added {new Date(supplier.createdAt).toLocaleDateString()}</span>
                                <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View History</button>
                            </div>
                        </div>
                    ))
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
                onSuccess={fetchSuppliers}
                supplier={selectedSupplier}
            />
        </div>
    );
}
