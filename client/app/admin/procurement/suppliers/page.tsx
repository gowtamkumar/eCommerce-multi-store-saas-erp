'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/services/api';
import SupplierList from '@/features/admin/supplier/components/SupplierList';
import SupplierModal from '@/features/admin/supplier/components/SupplierModal';
import { Supplier } from '@/features/admin/supplier/types';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

    const debouncedSearch = useDebounce(searchQuery, 400);

    const loadSuppliers = async (currentPage: number, search: string) => {
        setLoading(true);
        setIsSearchLoading(!!search);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(search && { q: search })
            });
            const res = await fetchAPI(`/suppliers?${params}`);
            if (res && res.success && res.data) {
                setSuppliers(res.data.items || []);
                setPagination({
                    page: res.data.page || 1,
                    limit: res.data.limit || 10,
                    total: res.data.total || 0,
                    totalPages: res.data.totalPages || 1
                });
            }
        } catch (error) {
            console.error('Failed to load suppliers:', error);
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
            setIsSearchLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers(page, debouncedSearch);
    }, [page, debouncedSearch]);

    // Reset to page 1 on search change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleAdd = () => {
        setEditingSupplier(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await fetchAPI(`/suppliers/${id}`, { method: 'DELETE' });
                toast.success('Supplier deleted successfully');
                loadSuppliers(page, debouncedSearch);
            } catch (error) {
                console.error('Failed to delete supplier:', error);
                toast.error('Failed to delete supplier');
            }
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <SupplierList
                suppliers={suppliers}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={pagination}
                onPageChange={setPage}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSearchLoading={isSearchLoading}
            />

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => loadSuppliers(page, debouncedSearch)}
                supplier={editingSupplier}
            />
        </div>
    );
}
