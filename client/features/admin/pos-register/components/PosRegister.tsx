'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
    Building2,
    History,
    Calendar,
    DollarSign,
    Users,
    Clock,
    AlertCircle,
    Info
} from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/shared/ConfirmModal';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

export default function PosRegisters() {
    const [activeTab, setActiveTab] = useState<'registers' | 'shifts'>('registers');
    const [registers, setRegisters] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegister, setEditingRegister] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Shift History State
    const [shifts, setShifts] = useState<any[]>([]);
    const [loadingShifts, setLoadingShifts] = useState(false);
    const [selectedShift, setSelectedShift] = useState<any>(null);
    const [shiftSearchQuery, setShiftSearchQuery] = useState('');
    const [shiftStatusFilter, setShiftStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Reset pagination page whenever filters or search terms change
    useEffect(() => {
        setCurrentPage(1);
    }, [shiftSearchQuery, shiftStatusFilter, activeTab]);

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

    const loadShifts = async () => {
        try {
            setLoadingShifts(true);
            const res = await fetchAPI('/pos/shift');
            if (res.success) {
                setShifts(res.data || []);
            }
        } catch (error) {
            console.error('Failed to load POS shifts history', error);
            toast.error('Failed to load Shift History');
        } finally {
            setLoadingShifts(false);
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

    const filteredShifts = shifts.filter(shift => {
        const matchesSearch = 
            (shift.user?.username || '').toLowerCase().includes(shiftSearchQuery.toLowerCase()) ||
            (shift.user?.email || '').toLowerCase().includes(shiftSearchQuery.toLowerCase()) ||
            (shift.register?.name || '').toLowerCase().includes(shiftSearchQuery.toLowerCase());
        
        const matchesStatus = 
            shiftStatusFilter === 'ALL' || 
            shift.status === shiftStatusFilter;

        return matchesSearch && matchesStatus;
    });

    // Client-side pagination logic
    const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
    const paginatedShifts = filteredShifts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const shiftColumns = useMemo<DataTableColumn<any>[]>(() => [
        {
            key: 'user',
            header: 'Cashier',
            className: 'p-4 font-bold text-slate-800 dark:text-slate-200',
            cell: (shift) => shift.user?.username || shift.user?.email || shift.userId.substring(0, 8),
        },
        {
            key: 'register',
            header: 'Terminal',
            className: 'p-4 font-semibold text-slate-600 dark:text-slate-300',
            cell: (shift) => shift.register?.name || 'N/A',
        },
        {
            key: 'openingTime',
            header: 'Opened At',
            className: 'p-4 text-xs text-slate-500 dark:text-slate-400 font-medium',
            cell: (shift) => new Date(shift.openingTime).toLocaleString(),
        },
        {
            key: 'closingTime',
            header: 'Closed At',
            className: 'p-4 text-xs text-slate-500 dark:text-slate-400 font-medium',
            cell: (shift) => shift.closingTime ? new Date(shift.closingTime).toLocaleString() : '-',
        },
        {
            key: 'expectedClosingBalance',
            header: 'Expected',
            headerClassName: 'text-right',
            className: 'p-4 text-right font-semibold text-slate-700 dark:text-slate-355',
            cell: (shift) => `$${Number(shift.expectedClosingBalance).toFixed(2)}`,
        },
        {
            key: 'closingBalance',
            header: 'Audited Actual',
            headerClassName: 'text-right',
            className: 'p-4 text-right font-extrabold text-slate-800 dark:text-slate-200',
            cell: (shift) => shift.closingBalance !== null ? `$${Number(shift.closingBalance).toFixed(2)}` : '-',
        },
        {
            key: 'variance',
            header: 'Variance',
            headerClassName: 'text-right',
            className: 'p-4 text-right font-black',
            cell: (shift) => {
                const variance = shift.difference !== null ? Number(shift.difference) : 0;
                if (shift.status !== 'CLOSED') {
                    return <span className="text-slate-400 font-bold">-</span>;
                }
                if (variance === 0) {
                    return <span className="text-emerald-600 dark:text-emerald-400">$0.00</span>;
                }
                if (variance > 0) {
                    return <span className="text-emerald-500">+${variance.toFixed(2)}</span>;
                }
                return <span className="text-red-500">-${Math.abs(variance).toFixed(2)}</span>;
            },
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'text-center',
            className: 'p-4 text-center',
            cell: (shift) => (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    shift.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-455'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                    {shift.status === 'OPEN' ? 'Open / Active' : 'Audited'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-center',
            className: 'p-4 text-center',
            cell: (shift) => (
                <button
                    type="button"
                    onClick={() => setSelectedShift(shift)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                    title="View Shift Detail"
                >
                    <Info className="w-4 h-4" />
                    Details
                </button>
            ),
        },
    ], []);

    const dataTablePagination = useMemo(() => ({
        page: currentPage,
        total: filteredShifts.length,
        totalPages: totalPages,
        onPageChange: (p: number) => setCurrentPage(p),
    }), [currentPage, filteredShifts.length, totalPages]);

    const dataTablePaginationSummary = useMemo(() => (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Page <span className="text-slate-900 dark:text-white px-1">{currentPage}</span> of <span className="text-slate-900 dark:text-white px-1">{totalPages}</span>
        </p>
    ), [currentPage, totalPages]);

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
                        POS Till Audit & Terminal Management
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Manage register terminals, local branches, and review cashier shift audits and drawer variance records.
                    </p>
                </div>

                {activeTab === 'registers' && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 self-start md:self-center"
                    >
                        <Plus className="w-4 h-4" />
                        New Register
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('registers')}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 px-2 ${
                        activeTab === 'registers'
                            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-slate-400 hover:text-slate-655'
                    }`}
                >
                    Register Terminals
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('shifts');
                        loadShifts();
                    }}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 px-2 ${
                        activeTab === 'shifts'
                            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-slate-400 hover:text-slate-655'
                    }`}
                >
                    Till Audits & Shifts History
                </button>
            </div>

            {/* TAB CONTENT: REGISTERS */}
            {activeTab === 'registers' && (
                <div className="space-y-6">
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
                </div>
            )}

            {/* TAB CONTENT: SHIFTS AUDIT HISTORY */}
            {activeTab === 'shifts' && (
                <div className="space-y-6">
                    {/* Filter and Search controls */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={shiftSearchQuery}
                                onChange={(e) => setShiftSearchQuery(e.target.value)}
                                placeholder="Search by Cashier, Terminal name..."
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                value={shiftStatusFilter}
                                onChange={(e) => setShiftStatusFilter(e.target.value as any)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-bold"
                            >
                                <option value="ALL">All Shift Statuses</option>
                                <option value="OPEN">Active / Open</option>
                                <option value="CLOSED">Audited & Closed</option>
                            </select>
                        </div>
                    </div>

                    <DataTable
                        data={paginatedShifts}
                        columns={shiftColumns}
                        getRowKey={(shift) => shift.id}
                        loading={loadingShifts}
                        loadingLabel="Scanning shifts registry..."
                        emptyLabel="No cashier shift audits recorded."
                        containerClassName="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden"
                        minWidthClassName="min-w-[1000px]"
                        pagination={dataTablePagination}
                        paginationSummary={dataTablePaginationSummary}
                    />
                </div>
            )}

            {/* Shift Detail Modal */}
            <AnimatePresence>
                {selectedShift && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <History className="w-6 h-6 text-brand-600" />
                                    Shift Audit Report
                                </h4>
                                <button
                                    onClick={() => setSelectedShift(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Core Shift Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-sm">
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Cashier / User</span>
                                        <span className="font-extrabold text-slate-900 dark:text-white">{selectedShift.user?.username || selectedShift.user?.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">POS Register</span>
                                        <span className="font-extrabold text-slate-900 dark:text-white">{selectedShift.register?.name || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Opened At</span>
                                        <span className="font-medium text-slate-600 dark:text-slate-350">{new Date(selectedShift.openingTime).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Closed At</span>
                                        <span className="font-medium text-slate-600 dark:text-slate-350">
                                            {selectedShift.closingTime ? new Date(selectedShift.closingTime).toLocaleString() : 'Active Shift'}
                                        </span>
                                    </div>
                                </div>

                                {/* Reconciliation Card */}
                                <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Drawer Reconciliation</h5>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                            <span>Opening Base Cash</span>
                                            <span>${Number(selectedShift.openingBalance).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                            <span>Cash Sales Collected</span>
                                            <span className="text-emerald-600 dark:text-emerald-450">+${Number(selectedShift.cashSales).toFixed(2)}</span>
                                        </div>
                                        {Number(selectedShift.cashIn || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                                <span>Cash In (Adjustments)</span>
                                                <span className="text-emerald-600 dark:text-emerald-450">+${Number(selectedShift.cashIn).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {Number(selectedShift.cashOut || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                                <span>Cash Out (Adjustments)</span>
                                                <span className="text-rose-600 dark:text-rose-450">-${Number(selectedShift.cashOut).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xs font-black text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-2">
                                            <span>Expected Drawer Cash</span>
                                            <span>${Number(selectedShift.expectedClosingBalance).toFixed(2)}</span>
                                        </div>
                                        {selectedShift.status === 'CLOSED' && (
                                            <>
                                                <div className="flex justify-between text-xs font-black text-slate-800 dark:text-slate-200">
                                                    <span>Actual Audited Cash Count</span>
                                                    <span>${Number(selectedShift.closingBalance).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-black border-t border-slate-100 dark:border-slate-800 pt-2">
                                                    <span className="flex items-center gap-1">
                                                        <AlertCircle className={`w-4 h-4 ${Number(selectedShift.difference) === 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                                                        Discrepancy (Variance)
                                                    </span>
                                                    <span className={Number(selectedShift.difference) === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                        {Number(selectedShift.difference) === 0 
                                                            ? '$0.00' 
                                                            : Number(selectedShift.difference) > 0 
                                                                ? `+$${Number(selectedShift.difference).toFixed(2)} (Overage)` 
                                                                : `-$${Math.abs(Number(selectedShift.difference)).toFixed(2)} (Shortage)`
                                                        }
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Non-Cash Payments Breakdown */}
                                <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Payment Breakdown (Totals)</h5>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Cash</span>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">${Number(selectedShift.cashSales).toFixed(2)}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Card</span>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">${Number(selectedShift.cardSales || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Mobile</span>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">${Number(selectedShift.mobileSales || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks */}
                                {selectedShift.remarks && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase">Audit Remarks</label>
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs text-slate-700 dark:text-slate-350 font-medium italic">
                                            "{selectedShift.remarks}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedShift(null)}
                                className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-sm transition-all"
                            >
                                Close Report
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
