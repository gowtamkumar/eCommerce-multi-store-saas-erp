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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Suppliers</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your product suppliers and contact info</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Supplier
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name, contact or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Supplier</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact Person</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email/Phone</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Address</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading suppliers...</td></tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No suppliers found.</td></tr>
                            ) : (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
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
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(supplier)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
