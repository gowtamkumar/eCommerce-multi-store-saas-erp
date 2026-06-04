'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { DataTableSortOrder } from '@/components/shared/DataTable';
import {
    Shift,
    ShiftSortKey,
    PosRegisterTerminal,
    Branch,
    RegisterFormData
} from '../types';
import { cashierLabel, exportShiftsToCSV } from '../utils/posRegisterHelpers';

export function usePosRegisterDashboard() {
    const [activeTab, setActiveTab] = useState<'registers' | 'shifts'>('registers');
    const [registers, setRegisters] = useState<PosRegisterTerminal[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegister, setEditingRegister] = useState<PosRegisterTerminal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Shift History State
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loadingShifts, setLoadingShifts] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [shiftSearchQuery, setShiftSearchQuery] = useState('');
    const [shiftStatusFilter, setShiftStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [exporting, setExporting] = useState(false);

    // Shift sorting (client-side)
    const [sortBy, setSortBy] = useState<ShiftSortKey>('openingTime');
    const [sortOrder, setSortOrder] = useState<DataTableSortOrder>('DESC');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        branchId: '',
        status: 'ACTIVE'
    });

    const loadData = useCallback(async () => {
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
    }, []);

    const loadShifts = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadData]);

    const resetForm = useCallback((currentBranches: Branch[]) => {
        setFormData({
            name: '',
            branchId: currentBranches.length > 0 ? currentBranches[0].id : '',
            status: 'ACTIVE'
        });
        setEditingRegister(null);
    }, []);

    const openCreateModal = useCallback(() => {
        if (branches.length === 0) {
            toast.error('You must define at least one Branch before creating POS Registers.');
            return;
        }
        resetForm(branches);
        setIsModalOpen(true);
    }, [branches, resetForm]);

    const openEditModal = useCallback((reg: PosRegisterTerminal) => {
        setEditingRegister(reg);
        setFormData({
            name: reg.name,
            branchId: reg.branchId || '',
            status: reg.status || 'ACTIVE'
        });
        setIsModalOpen(true);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
                resetForm(branches);
                void loadData();
            }
        } catch (error) {
            console.error('Error saving register', error);
            const message = error instanceof Error ? error.message : 'Error saving POS Register Terminal';
            toast.error(message);
        }
    }, [editingRegister, formData, branches, resetForm, loadData]);

    const handleDelete = useCallback((id: string) => {
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
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    }, []);

    const filteredRegisters = useMemo(() => {
        return registers.filter(reg =>
            reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (reg.branch?.name && reg.branch.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [registers, searchQuery]);

    const filteredShifts = useMemo(() => {
        return shifts.filter(shift => {
            const matchesSearch =
                (shift.user?.username || '').toLowerCase().includes(shiftSearchQuery.toLowerCase()) ||
                (shift.user?.email || '').toLowerCase().includes(shiftSearchQuery.toLowerCase()) ||
                (shift.register?.name || '').toLowerCase().includes(shiftSearchQuery.toLowerCase());

            const matchesStatus =
                shiftStatusFilter === 'ALL' ||
                shift.status === shiftStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [shifts, shiftSearchQuery, shiftStatusFilter]);

    const sortedShifts = useMemo(() => {
        const toNum = (value: number | string | null | undefined) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        const getValue = (shift: Shift): number | string => {
            switch (sortBy) {
                case 'cashier': return cashierLabel(shift).toLowerCase();
                case 'terminal': return (shift.register?.name || '').toLowerCase();
                case 'openingTime': return new Date(shift.openingTime).getTime();
                case 'closingTime': return shift.closingTime ? new Date(shift.closingTime).getTime() : 0;
                case 'expected': return toNum(shift.expectedClosingBalance);
                case 'actual': return shift.closingBalance !== null ? toNum(shift.closingBalance) : Number.NEGATIVE_INFINITY;
                case 'variance': return shift.status === 'CLOSED' ? toNum(shift.difference) : Number.NEGATIVE_INFINITY;
                case 'status': return shift.status;
                default: return 0;
            }
        };
        return [...filteredShifts].sort((a, b) => {
            const av = getValue(a);
            const bv = getValue(b);
            const cmp =
                typeof av === 'string' && typeof bv === 'string'
                    ? av.localeCompare(bv)
                    : (av as number) - (bv as number);
            return sortOrder === 'ASC' ? cmp : -cmp;
        });
    }, [filteredShifts, sortBy, sortOrder]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(sortedShifts.length / itemsPerPage));
    }, [sortedShifts.length, itemsPerPage]);

    const paginatedShifts = useMemo(() => {
        return sortedShifts.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [sortedShifts, currentPage, itemsPerPage]);

    const handleShiftSort = useCallback((key: string) => {
        const sortKey = key as ShiftSortKey;
        setSortBy(prevSortBy => {
            if (prevSortBy === sortKey) {
                setSortOrder(prevOrder => (prevOrder === 'ASC' ? 'DESC' : 'ASC'));
            } else {
                setSortOrder('DESC');
            }
            return sortKey;
        });
        setCurrentPage(1);
    }, []);

    const handleExportShifts = useCallback(() => {
        setExporting(true);
        exportShiftsToCSV(sortedShifts);
        setExporting(false);
    }, [sortedShifts]);

    return {
        activeTab,
        setActiveTab,
        registers,
        branches,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingRegister,
        searchQuery,
        setSearchQuery,
        shifts,
        loadingShifts,
        selectedShift,
        setSelectedShift,
        shiftSearchQuery,
        setShiftSearchQuery,
        shiftStatusFilter,
        setShiftStatusFilter,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        exporting,
        sortBy,
        sortOrder,
        confirmModal,
        setConfirmModal,
        formData,
        setFormData,
        loadShifts,
        openCreateModal,
        openEditModal,
        handleSubmit,
        handleDelete,
        filteredRegisters,
        filteredShifts,
        sortedShifts,
        totalPages,
        paginatedShifts,
        handleShiftSort,
        handleExportShifts,
    };
}
