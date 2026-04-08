'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Supplier, PaginationState } from '../types';
import SupplierList from './SupplierList';

// Lazy load the modal to optimize initial bundle size
const SupplierModal = dynamic(() => import('./SupplierModal'), {
    loading: () => null,
});

export default function SupplierDashboard() {
    // List State
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    /**
     * Fetches the list of suppliers with pagination and search
     */
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
            toast.error('Failed to load suppliers. Please try again.');
        } finally {
            setLoading(false);
            setIsSearchLoading(false);
        }
    }, [pagination.limit]);

    // Effect to trigger fetch on search or pagination change
    useEffect(() => {
        fetchSuppliers(1, debouncedSearch);
    }, [debouncedSearch, fetchSuppliers]);

    /**
     * Handlers for user actions
     */
    const handleAdd = useCallback(() => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Supplier',
            message: 'Are you sure you want to delete this supplier? This action cannot be undone and may affect associated products.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await fetchAPI(`/suppliers/${id}`, { method: 'DELETE' });
                    // Optimistic UI update
                    setSuppliers(prev => prev.filter((s) => s.id !== id));
                    toast.success('Supplier deleted successfully');
                } catch (error) {
                    toast.error('Error deleting supplier. It might be linked to existing products.');
                }
            },
        });
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        setIsSearchLoading(true);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSuppliers(newPage, debouncedSearch);
        }
    }, [pagination.totalPages, fetchSuppliers, debouncedSearch]);

    const handleModalSuccess = useCallback(() => {
        setIsModalOpen(false);
        fetchSuppliers(pagination.page, debouncedSearch);
    }, [fetchSuppliers, pagination.page, debouncedSearch]);

    return (
        <>
            <SupplierList
                suppliers={suppliers}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                pagination={pagination}
                onPageChange={handlePageChange}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSearchLoading={isSearchLoading}
            />

            {/* Modals are managed by the orchestrator */}
            {isModalOpen && (
                <SupplierModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleModalSuccess}
                    supplier={selectedSupplier}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </>
    );
}
