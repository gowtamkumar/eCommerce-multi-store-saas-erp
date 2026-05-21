'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, 
    Plus, 
    Trash2, 
    Edit2, 
    X, 
    Loader2, 
    Check, 
    ShieldAlert, 
    Building2 
} from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function PosRegisters() {
    const [registers, setRegisters] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegister, setEditingRegister] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [formData, setFormData] = useState({
        name: '',
        branchId: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [regRes, branchRes] = await Promise.all([
                fetchAPI('/pos/register'),
                fetchAPI('/system/branches')
            ]);
            if (regRes.success) {
                setRegisters(regRes.data || []);
            }
            if (branchRes.success) {
                setBranches(branchRes.data || []);
            }
        } catch (error) {
            console.error('Failed to load POS registers data', error);
            toast.error('Failed to load POS Register Terminals');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            branchId: branches.length > 0 ? branches[0].id : '',
            status: 'ACTIVE'
        });
        setEditingRegister(null);
    };

    const openCreateModal = () => {
        resetForm();
        if (branches.length === 0) {
            toast.error('You must define at least one Branch before creating POS Registers.');
            return;
        }
        setIsModalOpen(true);
    };

    const openEditModal = (reg: any) => {
        setEditingRegister(reg);
        setFormData({
            name: reg.name,
            branchId: reg.branchId || '',
            status: reg.status || 'ACTIVE'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.branchId) {
            toast.error('A linked branch is required');
            return;
        }
        try {
            const url = editingRegister ? `/pos/register/${editingRegister.id}` : '/pos/register';
            const method = editingRegister ? 'PATCH' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData)
            });

            if (res.success) {
                toast.success(`POS Terminal ${editingRegister ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
                resetForm();
                loadData();
            }
        } catch (error: any) {
            console.error('Error saving register', error);
            toast.error(error.message || 'Error saving POS Register Terminal');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete POS Register Terminal',
            message: 'Are you sure you want to delete this POS register terminal? Cashier shifts associated with this terminal will become orphaned.',
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(`/pos/register/${id}`, { method: 'DELETE' });
                    if (res.success) {
                        toast.success('POS Register Terminal deleted successfully');
                        setRegisters(prev => prev.filter(r => r.id !== id));
                    }
                } catch (error) {
                    console.error('Error deleting register', error);
                    toast.error('Error deleting POS Register Terminal');
                }
            }
        });
    };

    const filteredRegisters = registers.filter(reg => 
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reg.branch?.name && reg.branch.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                        <Monitor className="w-5 h-5 text-brand-600" />
                        POS Register Terminals
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Define physical counter desks, register terminals, and map them to localized business branches.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 self-start md:self-center"
                >
                    <Plus className="w-4 h-4" />
                    New Register
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search registers by name or linked branch..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                />
            </div>

            {/* Registers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegisters.map((reg) => (
                    <motion.div
                        key={reg.id}
                        layout
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                                    <Monitor className="w-6 h-6 text-brand-600" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEditModal(reg)} 
                                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                        title="Edit Register"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(reg.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        title="Delete Register"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{reg.name}</h5>
                            
                            {reg.branch && (
                                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 rounded-lg w-fit">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {reg.branch.name}
                                </div>
                            )}

                            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-4">
                                <div className="flex items-center gap-2">
                                    <Check className={`w-4 h-4 ${reg.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <span className="font-bold">
                                        {reg.status === 'ACTIVE' ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">Terminal Online / Ready</span>
                                        ) : (
                                            <span className="text-slate-400">Terminal Inactive / Offline</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredRegisters.length === 0 && (
                    <div className="col-span-full py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        <span>No register terminals found. Set one up to allow opening cashier shifts and collecting sales.</span>
                    </div>
                )}
            </div>

            {/* Register Form Modal */}
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
                                {editingRegister ? 'Edit Register Terminal' : 'New Register Terminal'}
                            </h4>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Terminal Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                                        placeholder="e.g. Front Desk Terminal 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Linked Branch</label>
                                    <select
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold"
                                        required
                                    >
                                        <option value="" disabled>Select Linked Branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold"
                                    >
                                        <option value="ACTIVE">Active / Online</option>
                                        <option value="INACTIVE">Inactive / Offline</option>
                                    </select>
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
                                        {editingRegister ? 'Update' : 'Create'}
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
